import { DB } from "./database.js";
import keys from "./config/keys.js";
function isValidURL(req, res, next, handleErr) {
    const body = req.body;
    const url = body.url || "";
    if (url.length === 0)
        return handleErr({
            status: 400,
            message: "Please first put your URL here.",
        });
    const validURL = (str) => {
        return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
    };
    if (validURL(url)) {
        next();
    }
    else {
        return handleErr({ status: 400, message: "The URL you put is not valid." });
    }
}
async function checkRealUrlExistence(req, res, next, handleErr) {
    try {
        let userId = req.user ? req.user.id : null;
        const body = req.body;
        const realUrl = body.url || "";
        let result;
        if (userId) {
            result = await DB.find(`SELECT * FROM urls WHERE real_url = '${realUrl}' AND user_id = '${userId}'`);
        }
        else {
            result = await DB.find(`SELECT * FROM urls WHERE real_url = '${realUrl}' AND user_id IS NULL`);
        }
        if (result.id) {
            res.status(200).json({
                URLId: result.id,
                realURL: result.real_url,
                shortenedURL: `${keys.domain}/${result.shortened_url_id}`,
            });
        }
        else {
            next();
        }
    }
    catch (error) {
        return handleErr(error);
    }
}
async function checkUrlOwnership(req, res, next, handleErr) {
    const urlId = req.vars?.id;
    const { user_id } = await DB.find(`SELECT user_id FROM urls WHERE id=${urlId}`);
    if (user_id === req.user.id) {
        next();
    }
    else {
        return handleErr({ status: 403, message: "Not allowed to access." });
    }
}
async function requireAuth(req, res, next, handleErr) {
    if (!req.user)
        return handleErr({ status: 401, message: "Unauthorized" });
    next();
}
const middlewares = {
    isValidURL,
    checkRealUrlExistence,
    checkUrlOwnership,
    requireAuth,
};
export default middlewares;
//# sourceMappingURL=middlewares.js.map