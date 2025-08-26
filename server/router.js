import passport from "passport";
import middlewares from "./middlewares.js";
import Auth from "./controllers/auth.js";
import Url from "./controllers/url.js";

// ------------------------------------------------ //
// ************ AUTH ROUTES ************* //
// ------------------------------------------------ //

export default (server) => {
  server.route(
    "get",
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  server.route(
    "get",
    "/auth/google/callback",
    passport.authenticate("google"),
    (req, res) => {
      res.redirect("/");
    }
  );

  server.route("get", "/logout", Auth.logOut);

  // Check to see if a user is logged in or not
  server.route("post", "/auth", Auth.isLoggedIn);

  // ------------------------------------------------ //
  // ************ URL ROUTES ************* //
  // ------------------------------------------------ //

  // Return the list of urls user has shortened
  server.route("get", "/url", middlewares.requireAuth, Url.getUrls);

  // Get the url, shorten it and save to database
  server.route(
    "post",
    "/url",
    middlewares.isValidURL,
    middlewares.checkRealUrlExistence,
    Url.shorten
  );

  // Redirect to the real url
  server.route("get", "/:id", Url.redirect);

  // Delete an url record
  server.route(
    "delete",
    "/url/:id",
    middlewares.requireAuth,
    middlewares.checkUrlOwnership,
    Url.remove
  );
};
