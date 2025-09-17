import type {
  CpeakRequest as Request,
  CpeakResponse as Response,
  HandleErr,
} from "cpeak";

import path from "path";
import { DB } from "../database.js";
import util from "../lib/util.js";
import keys from "../config/keys.js";

const publicPath = new URL("../../public", import.meta.url).pathname;

// Return the list of urls user has shortened
const getUrls = async (req: Request, res: Response) => {
  let data = await DB.find(
    `SELECT real_url, shortened_url_id, id FROM urls WHERE user_id=${req.user.id} ORDER BY created_at DESC`
  );

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
  // Get the user id if the use is logged in
  let userId = req.user ? req.user.id : null;

  const realUrl = (req.body as { url: string }).url;
  // Generate a 6 digits number to be used as url shortened id
  let urlId = (Math.floor(Math.random() * 90000) + 100000).toString();

  let url_ids = [];

  const shortened_url_ids = await DB.find("SELECT shortened_url_id FROM urls");

  if (shortened_url_ids[0]) {
    shortened_url_ids.map((id: { shortened_url_id: string }) => {
      url_ids.push(id.shortened_url_id);
    });
  } else {
    url_ids.push(shortened_url_ids.shortened_url_id);
  }

  while (url_ids.includes(urlId)) {
    urlId = String(Math.floor(Math.random() * 90000) + 10000);
  }

  // Insert a new record to url table
  let insertedId = null;
  if (userId) {
    insertedId = await DB.insert("urls", {
      real_url: realUrl,
      shortened_url_id: urlId,
      user_id: userId,
    });
  } else {
    await DB.insert("urls", { real_url: realUrl, shortened_url_id: urlId });
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

  const { real_url, id } = await DB.find(
    `SELECT real_url, id FROM urls WHERE shortened_url_id=${req.vars.id}`
  );

  // We have found the link
  if (id) {
    // increment the views number by one
    await DB.update(`UPDATE urls SET views = views + 1 WHERE id = ?`, [id]);

    res.redirect(real_url);
  } else {
    res.sendFile(path.join(publicPath, "./no-url.html"), "text/html");
  }
};

// Delete an url record
const remove = async (req: Request, res: Response) => {
  await DB.delete(`DELETE FROM urls WHERE id=${req.vars?.id}`);
  res.json({ message: "deleted" });
};

export default { getUrls, shorten, redirect, remove };
