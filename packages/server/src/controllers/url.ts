import type {
  CpeakRequest as Request,
  CpeakResponse as Response,
  HandleErr,
} from "cpeak";
import QRCode from "qrcode";
import path from "path";
import crypto from "crypto";
import type { LinkType } from "@weer/common";
import { DB } from "../database/index.js";
import { IUrl, ISession } from "../database/types.js";
import util from "../lib/util.js";
import keys from "../config/keys.js";

const publicPath = new URL("../../public", import.meta.url).pathname;
const MAX_ATTEMPTS = 10; // Max number of retries for generating unique IDs (QR Code and Shortened URL id)

// Return the list of urls user has shortened
const getUrls = async (req: Request, res: Response) => {
  let data;

  if (req.user) {
    data = await DB.findMany<IUrl>(
      `SELECT id, real_url, shortened_url_id, link_type FROM urls WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
  } else if (req.session?.session_token) {
    const session = await DB.find<ISession>(
      "SELECT id FROM sessions WHERE session_token=$1",
      [req.session.session_token]
    );

    data = await DB.findMany<IUrl>(
      `SELECT id, real_url, shortened_url_id, link_type FROM urls WHERE session_id=$1 ORDER BY created_at DESC`,
      [session?.id]
    );
  } else {
    return res.json({ urls: [], domain: keys.domain });
  }

  res.json({
    urls: data,
    domain: keys.domain,
  });
};

interface IRequestBody {
  url: string;
  type: "default" | "ultra" | "digits" | "custom" | "customOnUsername";
  custom?: string; // only if type is custom or customOnUsername
}

/**
 * Generates a unique "default" type shortened URL ID for the given database URL ID.
 * The default type is a 6-Character Code, only lowercase alphabets and digits, without o or l. In redirecting, o is treated as 0 and l as i.
 *
 * @param id The database URL ID to update with the generated shortened URL ID
 * @returns The generated shortened URL Code
 */
const generateDefault = async (id: number) => {
  let updated = false;
  let attempts = 0;
  let shortenedCode;

  // Total combinations: 34^6  = 1,544,804,416
  const possibleChars = "abcdefghijkmnpqrstuvwxyz0123456789"; // removed o and l to avoid confusion
  const codeLength = 6;

  // We will retry updating the record just like before with the QR code id
  while (!updated && attempts <= 10) {
    // Generate a 6-character code to be used as url shortened id
    const bytes = crypto.randomBytes(codeLength);
    shortenedCode = "";
    for (let i = 0; i < codeLength; i++) {
      shortenedCode += possibleChars[bytes[i] % possibleChars.length];
    }

    try {
      await DB.update<IUrl>(
        "urls",
        {
          shortened_url_id: shortenedCode,
        },
        `id = $2`,
        [id]
      );
      updated = true; // If update is successful, the ID is unique
      return shortenedCode;
    } catch (error: any) {
      console.log("======");
      // The official PostgreSQL error code for unique violations
      if (error.code === "23505") {
        // If there's a duplicate key error, generate a new ID and retry
        updated = false;
        attempts++;
      } else {
        throw error;
      }
    }
  }

  // Max attempts reached
  if (!updated) {
    throw new Error(
      `Could not generate a unique shortened URL ID after ${MAX_ATTEMPTS} attempts`
    );
  }
};

/**
 * Generates a unique "ultra" type shortened URL ID for the given database URL ID.
 * The ultra type is a 1 or 2 character code, only lowercase alphabets and digits.
 * Examples: a, b, z, 0, 5, az, 1z, z1, zl
 *
 * @param id The database URL ID to update with the generated shortened URL ID
 * @returns The generated shortened URL Code
 */
const generateUltra = async (id: number) => {
  const result = await DB.query(`
      SELECT code FROM ultra_codes
      WHERE url_id IS NULL OR expires_at < NOW()
      ORDER BY length(code), code
      LIMIT 1;
  `);

  console.log(result);

  // SELECT code FROM ultra_codes WHERE expires_at > NOW() OR expires_at IS NULL LIMIT 1 SORT BY code ASC;
};

// Get the url, shorten it and save to database
const shorten = async (
  req: Request<IRequestBody>,
  res: Response,
  handleError: HandleErr
) => {
  // Get the user id if the user is logged in
  let userId = req.user ? req.user.id : null;

  // Get the session token for when the user is not logged in
  let sessionToken = req.session?.session_token;

  const realUrl = req.body?.url;

  /* ---------------------------------------------------------------------------------- 
          We will first generate a code for the QR code and then insert the record. 
          Afterwards, we will update that record with the a requested generated code.
     -------------------------------------------------------------------------------- */

  /*                                FOR QR CODE ID:
    7 bytes (56 bits) gives 2^56 = 72,057,594,037,927,936 combination.
    The base65url encoding safely converts binary data into a URL valid string without losing entropy.

    Based on the Birthday Paradox, after generating around 1 billion random codes, there is roughly a 0.999 (99.9%) probability
    that at least one collision will occur somewhere in that entire set.

    This means that out of 1 billion inserts, we should expect only 
    a handful of duplicates (about 7 on average) due to random chance. There is a per-insert 
    collision probability of about 7×10⁻⁹ (0.0000007%).

    This is trivial though but we must still handle collisions in the database (we'll retry on unique constraint violation of Postgres).
  */

  let inserted_url: IUrl;

  let QRCodeId;
  let inserted = false;
  let attempts = 0; // to avoid infinite loops, we will try only 10 times

  // Insert into database, if there's a conflict, retry
  while (!inserted && attempts <= MAX_ATTEMPTS) {
    try {
      QRCodeId = crypto.randomBytes(7).toString("base64url");

      inserted_url = await DB.insert<IUrl>("urls", {
        real_url: realUrl,
        qr_code_id: QRCodeId,
        user_id: userId ? userId : undefined,
        session_id: !userId
          ? (
              await DB.find<ISession>(
                "SELECT id FROM sessions WHERE session_token=$1",
                [sessionToken]
              )
            )?.id
          : undefined,
      });

      inserted = true; // If insert is successful, the ID is unique
    } catch (error: any) {
      if (error.code === "23505") {
        // The official PostgreSQL error code for unique violations
        // If there's a duplicate key error, generate a new ID and retry
        inserted = false;
        attempts++;
      } else {
        return handleError(error); // Handle other errors
      }
    }
  }

  // Max attempts reached
  if (!inserted) {
    return handleError(
      new Error(
        `Could not generate a unique QR code ID after ${MAX_ATTEMPTS} attempts`
      )
    );
  }

  /* ---------------------------------------------------------------------------------- 
          At this point we have inserted the record with a unique QR code id. 
          Now we will generate a unique shortened URL id and update the record.
     -------------------------------------------------------------------------------- */

  const type = req.body?.type as LinkType;
  const custom = req.body?.custom;

  let shortenedCode;

  switch (type) {
    case "default":
      try {
        shortenedCode = await generateDefault(inserted_url!.id);
      } catch (error) {
        return handleError(error);
      }
      break;

    case "ultra":
      try {
        shortenedCode = await generateUltra(inserted_url!.id);
      } catch (error) {
        return handleError(error);
      }
      break;

    // case "digits":

    // case "custom":

    // case "customOnUsername":

    default:
      return handleError({ status: 400, message: "Invalid type" });
  }

  return res.json({
    URLId: inserted_url!.id,
    realURL: realUrl,
    linkType: type,
    shortenedURL: `${keys.domain}/${shortenedCode}`,
  });
};

// FIX ERROR RETURN IN CPEAK SEND FILE
// Redirect to the real url
const redirect = async (req: Request, res: Response, handleErr: HandleErr) => {
  if (!req.vars?.id) {
    return handleErr(new Error("No URL ID provided"));
  }

  if (!util.isValidUrlId(req.vars?.id)) {
    return res.sendFile(path.join(publicPath, "./no-url.html"), "text/html");
  }

  const url = await DB.find<IUrl>(
    `SELECT real_url, id, views FROM urls WHERE shortened_url_id=$1`,
    [req.vars.id]
  );

  if (!url) {
    return res.sendFile(path.join(publicPath, "./no-url.html"), "text/html");
  }

  // We have found the link
  // increment the views number by one
  await DB.update<IUrl>(
    "urls",
    {
      views: url.views + 1,
    },
    `id = $2`,
    [url.id]
  );

  res.redirect(url.real_url);
};

// Delete a url record
const remove = async (req: Request, res: Response) => {
  await DB.delete<IUrl>("urls", `id=$1`, [req.vars?.id]);
  res.json({ message: "deleted" });
};

// Generates and sends a QR code
const sendQrCode = async (
  req: Request,
  res: Response,
  handleErr: HandleErr
) => {
  const QR_CODE_VERSION = 4; // 33x33 matrix, 50 chars max
  const QR_CODE_ERROR_CORRECTION_LEVEL = "H"; // L, M, Q, H (L lowest, H highest)

  if (!req.vars?.id) {
    return handleErr({ status: 400, message: "No URL ID provided" });
  }

  const download = req.query.download === "true" ? true : false;
  const type = req.query.type === "png" ? "png" : "svg";
  let size = Number(req.query.size); // only for png valid options only: 256, 512, 1024, 2048

  // Validate size if type is png
  if (type === "png") {
    const validSizes = [256, 512, 1024, 2048];
    if (!validSizes.includes(size)) {
      size = 512; // default size
    }
  }

  const url = await DB.find<IUrl>(`SELECT qr_code_id FROM urls WHERE id=$1`, [
    req.vars.id,
  ]);

  if (!url) {
    return handleErr({ status: 404, message: "URL not found" });
  }

  const data = `${keys.domain}/${url.qr_code_id}`;

  // This header is needed to trigger a browser download
  if (download) {
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${url.qr_code_id}.${type}"`
    );
  }

  if (type === "svg") {
    try {
      const svg = await QRCode.toString(data, {
        type: "svg",
        version: QR_CODE_VERSION,
        margin: 0.5,

        errorCorrectionLevel: QR_CODE_ERROR_CORRECTION_LEVEL,
      });

      res.setHeader("Content-Type", "image/svg+xml");
      res.end(svg);
    } catch (error) {
      return handleErr(error);
    }
  } else {
    try {
      res.setHeader("Content-Type", "image/png");

      await QRCode.toFileStream(res, data, {
        version: QR_CODE_VERSION,
        margin: 0.5,
        errorCorrectionLevel: QR_CODE_ERROR_CORRECTION_LEVEL,
        width: size,
      });
    } catch (err) {
      return handleErr(err);
    }
  }
};

export default { getUrls, shorten, redirect, remove, sendQrCode };
