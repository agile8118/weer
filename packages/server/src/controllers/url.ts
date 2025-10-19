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
import { IUrl, ISession, IUltraCode } from "../database/types.js";
import util from "../lib/util.js";
import keys from "../config/keys.js";
import {
  generateDefault,
  generateUltra,
  generateQRCode,
  processCode,
} from "../lib/links.js";

const publicPath = new URL("../../public", import.meta.url).pathname;

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
      `
        SELECT
          urls.id,
          urls.real_url,
          urls.shortened_url_id,
          urls.link_type,
          ultra_codes.code AS ultra_code,
          ultra_codes.assigned_at AS assigned_at,
          ultra_codes.expires_at AS expires_at
        FROM urls
        LEFT JOIN ultra_codes
          ON urls.id = ultra_codes.url_id
          AND urls.link_type = 'ultra'
        WHERE urls.session_id = $1
        ORDER BY urls.created_at DESC;
      `,
      [session?.id]
    );
  } else {
    return res.json({ urls: [], domain: keys.domain });
  }

  // console.log(data);

  res.json({
    urls: DB.cleanResult(data),
    domain: keys.domain,
  });
};

/** @TODO clean this up */
interface IRequestBody {
  url: string;
  type: "default" | "ultra" | "digits" | "custom" | "customOnUsername";
  custom?: string; // only if type is custom or customOnUsername
}

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
          We will first insert the record and then generate a code for the QR code. 
          Afterwards, we will update that record with the a requested generated code.
     -------------------------------------------------------------------------------- */

  const insertedUrl = await DB.insert<IUrl>("urls", {
    real_url: realUrl,
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

  await generateQRCode(insertedUrl!.id);

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
        shortenedCode = await generateDefault(insertedUrl!.id);
      } catch (error) {
        return handleError(error);
      }
      break;

    case "ultra":
      try {
        shortenedCode = await generateUltra(insertedUrl!.id);
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
    URLId: insertedUrl!.id,
    realURL: realUrl,
    linkType: type,
    shortenedURL: `${keys.domain}/${shortenedCode}`,
  });
};

// Change the type of a url (e.g. from default to custom). User can do this from the customization modal
const changeUrlType = async (
  req: Request,
  res: Response,
  handleError: HandleErr
) => {
  const id = Number(req.vars?.id);
  const type = req.body?.type as LinkType;

  if (!id || !type) {
    return res.status(400).json({ message: "Missing parameters" });
  }

  let newShortenedCode;

  switch (type) {
    case "default":
      try {
        newShortenedCode = await generateDefault(id);
      } catch (error) {
        return handleError(error);
      }
      break;

    case "ultra":
      try {
        newShortenedCode = await generateUltra(id);
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
    type,
    shortenedURL: `${keys.domain}/${newShortenedCode}`,
  });
};

// FIX ERROR RETURN IN CPEAK SEND FILE
// Redirect to the real url
const redirect = async (req: Request, res: Response, handleErr: HandleErr) => {
  const code = req.vars?.id;

  if (!code) {
    return handleErr(new Error("No URL ID provided"));
  }

  console.log("Code:", code);

  const processedCode = processCode(code);

  if (!processedCode) {
    return res.sendFile(path.join(publicPath, "./no-url.html"), "text/html");
  }

  console.log(processedCode);

  let url;

  switch (processedCode.type) {
    case "ultra":
      url = await DB.find<IUrl>(
        `
        SELECT urls.real_url, urls.id, urls.views
        FROM urls
        JOIN ultra_codes
          ON urls.id = ultra_codes.url_id
        WHERE ultra_codes.code = $1
      `,
        [processedCode.code]
      );

      break;
    case "default":
      url = await DB.find<IUrl>(
        `SELECT real_url, id, views FROM urls WHERE shortened_url_id=$1`,
        [processedCode.code]
      );
  }

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
  let size = Number(req.query.size); // only for png, valid options are: 256, 512, 1024, 2048

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

export default {
  getUrls,
  shorten,
  redirect,
  remove,
  sendQrCode,
  changeUrlType,
};
