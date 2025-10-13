import type {
  CpeakRequest as Request,
  CpeakResponse as Response,
  HandleErr,
} from "cpeak";

import path from "path";
import crypto from "crypto";
import { DB } from "../database/index.js";
import { IUrl, ISession } from "../database/types.js";
import util from "../lib/util.js";
import keys from "../config/keys.js";

const publicPath = new URL("../../public", import.meta.url).pathname;

// Return the list of urls user has shortened
const getUrls = async (req: Request, res: Response) => {
  let data;

  if (req.user) {
    data = await DB.findMany<IUrl>(
      `SELECT real_url, shortened_url_id, id FROM urls WHERE user_id=$1 ORDER BY created_at DESC`,
      [req.user.id]
    );
  } else if (req.session?.session_token) {
    const session = await DB.find<ISession>(
      "SELECT id FROM sessions WHERE session_token=$1",
      [req.session.session_token]
    );

    data = await DB.findMany<IUrl>(
      `SELECT real_url, shortened_url_id, id FROM urls WHERE session_id=$1 ORDER BY created_at DESC`,
      [session?.id]
    );
  } else {
    return res.json({ urls: [], domain: keys.domain });
  }

  // If there's only one url
  if (!data.length && data.length !== 0) {
    // Create a new arr with the object if we have only one record
    let arr = [];
    arr.push(data);
    res.json({
      urls: arr,
      domain: keys.domain,
    });
    // If there is no url
  } else if (data.length === 0) {
    res.json({
      urls: [],
      domain: keys.domain,
    });
    // If there are more than one url
  } else {
    res.json({
      urls: data,
      domain: keys.domain,
    });
  }
};

// Get the url, shorten it and save to database
const shorten = async (req: Request, res: Response, handleError: HandleErr) => {
  const MAX_ATTEMPTS = 10; // Max number of retries for generating unique IDs (QR Code and Shortened URL id)

  // Get the user id if the user is logged in
  let userId = req.user ? req.user.id : null;

  // Get the session token for when the user is not logged in
  let sessionToken = req.session?.session_token;

  const realUrl = (req.body as { url: string }).url;

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

  let updated = false;
  attempts = 0;
  let urlId;

  // We will retry updating the record just like before with the QR code id
  while (!updated && attempts <= 10) {
    // Generate a 6 digits number to be used as url shortened id
    urlId = (Math.floor(Math.random() * 900000) + 100000).toString();

    try {
      await DB.update<IUrl>(
        "urls",
        {
          shortened_url_id: urlId,
        },
        `id = $2`,
        [inserted_url!.id]
      );
      updated = true; // If update is successful, the ID is unique
    } catch (error: any) {
      if (error.code === "23505") {
        // The official PostgreSQL error code for unique violations
        // If there's a duplicate key error, generate a new ID and retry
        updated = false;
        attempts++;
      } else {
        return handleError(error); // Handle other errors
      }
    }
  }

  // Max attempts reached
  if (!updated) {
    return handleError(
      new Error(
        `Could not generate a unique shortened URL ID after ${MAX_ATTEMPTS} attempts`
      )
    );
  }

  return res.json({
    URLId: inserted_url!.id,
    realURL: realUrl,
    shortenedURL: `${keys.domain}/${urlId}`,
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

// Delete an url record
const remove = async (req: Request, res: Response) => {
  await DB.delete<IUrl>("urls", `id=$1`, [req.vars?.id]);
  res.json({ message: "deleted" });
};

const sendQrCode = async (
  req: Request,
  res: Response,
  handleErr: HandleErr
) => {
  if (!req.vars?.id) {
    return handleErr(new Error("No URL ID provided"));
  }

  const url = await DB.find<IUrl>(`SELECT qr_code_id FROM urls WHERE id=$1`, [
    req.vars.id,
  ]);

  if (!url) {
    return handleErr(new Error("URL not found"));
  }

  const qrCode = await generateQrCode(`${keys.domain}/${url.qr_code_id}`);
  res.type("image/png").send(qrCode);
};

export default { getUrls, shorten, redirect, remove, sendQrCode };
