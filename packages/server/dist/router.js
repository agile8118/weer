import passport from "passport";
import middlewares from "./middlewares.js";
import Auth from "./controllers/auth.js";
import Url from "./controllers/url.js";
export default (app) => {
    app.route("get", "/auth/google", passport.authenticate("google", {
        scope: ["profile", "email"],
    }));
    app.route("get", "/auth/google/callback", passport.authenticate("google"), (req, res) => {
        res.redirect("/");
    });
    app.route("get", "/logout", Auth.logOut);
    app.route("post", "/auth", Auth.isLoggedIn);
    app.route("get", "/url", middlewares.requireAuth, Url.getUrls);
    app.route("post", "/url", middlewares.isValidURL, middlewares.checkRealUrlExistence, Url.shorten);
    app.route("get", "/:id", Url.redirect);
    app.route("delete", "/url/:id", middlewares.requireAuth, middlewares.checkUrlOwnership, Url.remove);
};
//# sourceMappingURL=router.js.map