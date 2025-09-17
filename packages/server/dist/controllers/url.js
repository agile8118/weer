import path from "path";
import { DB } from "../database.js";
import util from "../lib/util.js";
import keys from "../config/keys.js";
const publicPath = new URL("../../public", import.meta.url).pathname;
const getUrls = async (req, res) => {
    let data = await DB.find(`SELECT real_url, shortened_url_id, id FROM urls WHERE user_id=${req.user.id} ORDER BY created_at DESC`);
    if (!data.length && data.length !== 0) {
        let arr = [];
        arr.push(data);
        res.json({
            urls: arr,
            domain: keys.domain,
        });
    }
    else if (data.length === 0) {
        res.json({
            urls: [],
            domain: keys.domain,
        });
    }
    else {
        res.json({
            urls: data,
            domain: keys.domain,
        });
    }
};
const shorten = async (req, res) => {
    let userId = req.user ? req.user.id : null;
    const realUrl = req.body.url;
    let urlId = (Math.floor(Math.random() * 90000) + 100000).toString();
    let url_ids = [];
    const shortened_url_ids = await DB.find("SELECT shortened_url_id FROM urls");
    if (shortened_url_ids[0]) {
        shortened_url_ids.map((id) => {
            url_ids.push(id.shortened_url_id);
        });
    }
    else {
        url_ids.push(shortened_url_ids.shortened_url_id);
    }
    while (url_ids.includes(urlId)) {
        urlId = String(Math.floor(Math.random() * 90000) + 10000);
    }
    let insertedId = null;
    if (userId) {
        insertedId = await DB.insert("urls", {
            real_url: realUrl,
            shortened_url_id: urlId,
            user_id: userId,
        });
    }
    else {
        await DB.insert("urls", { real_url: realUrl, shortened_url_id: urlId });
    }
    return res.json({
        URLId: insertedId,
        realURL: realUrl,
        shortenedURL: `${keys.domain}/${urlId}`,
    });
};
const redirect = async (req, res, handleErr) => {
    if (!req.vars?.id) {
        return handleErr(new Error("No URL ID provided"));
    }
    if (!util.isValidUrlId(req.vars?.id)) {
        return res.sendFile(path.join(publicPath, "./no-url.html"), "text/html");
    }
    const { real_url, id } = await DB.find(`SELECT real_url, id FROM urls WHERE shortened_url_id=${req.vars.id}`);
    if (id) {
        await DB.update(`UPDATE urls SET views = views + 1 WHERE id = ?`, [id]);
        res.redirect(real_url);
    }
    else {
        res.sendFile(path.join(publicPath, "./no-url.html"), "text/html");
    }
};
const remove = async (req, res) => {
    await DB.delete(`DELETE FROM urls WHERE id=${req.vars?.id}`);
    res.json({ message: "deleted" });
};
export default { getUrls, shorten, redirect, remove };
//# sourceMappingURL=url.js.map