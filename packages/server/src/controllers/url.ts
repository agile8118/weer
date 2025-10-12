import type {
  CpeakRequest as Request,
  CpeakResponse as Response,
  HandleErr,
} from "cpeak";

import path from "path";
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
const shorten = async (req: Request, res: Response) => {
  // Get the user id if the user is logged in
  let userId = req.user ? req.user.id : null;

  // Get the session token if user is not logged in
  let sessionToken = req.session?.session_token;

  const realUrl = (req.body as { url: string }).url;

  // Generate a 6 digits number to be used as url shortened id
  let urlId = (Math.floor(Math.random() * 90000) + 100000).toString();

  let url_ids: string[] = [];

  // @Todo: Optimize this to not to fetch all the ids each time
  // Get all the existing shortened_url_id from database to check for uniqueness
  const shortened_urls = await DB.findMany<IUrl>(
    "SELECT shortened_url_id FROM urls"
  );

  shortened_urls.map((url: IUrl) => {
    url_ids.push(url.shortened_url_id);
  });

  // Make sure the generated id is unique
  while (url_ids.includes(urlId)) {
    urlId = String(Math.floor(Math.random() * 90000) + 10000);
  }

  // Insert a new record to url table
  let insertedId = null;
  if (userId) {
    insertedId = await DB.insert<IUrl>("urls", {
      real_url: realUrl,
      shortened_url_id: urlId,
      user_id: userId,
    });
  } else {
    const session = await DB.find<ISession>(
      "SELECT id FROM sessions WHERE session_token=$1",
      [sessionToken]
    );

    await DB.insert<IUrl>("urls", {
      real_url: realUrl,
      shortened_url_id: urlId,
      session_id: session?.id,
    });
  }

  return res.json({
    URLId: insertedId,
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

export default { getUrls, shorten, redirect, remove };
