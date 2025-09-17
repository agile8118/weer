import { DB } from "../database.js";
const logOut = (req, res) => {
    req.logout();
    res.redirect("/");
};
const isLoggedIn = async (req, res) => {
    if (req.user) {
        const { email } = await DB.find(`SELECT email FROM users WHERE id=${req.user.id}`);
        return res.json({ isSignedIn: true, email });
    }
    res.json({ isSignedIn: false });
};
export default { logOut, isLoggedIn };
//# sourceMappingURL=auth.js.map