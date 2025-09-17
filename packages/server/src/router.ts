import type {
  Cpeak,
  CpeakRequest as Request,
  CpeakResponse as Response,
} from "cpeak";

import passport from "passport";
import middlewares from "./middlewares.js";
import Auth from "./controllers/auth.js";
import Url from "./controllers/url.js";

// ------------------------------------------------ //
// ************ AUTH ROUTES ************* //
// ------------------------------------------------ //

export default (app: Cpeak) => {
  app.route(
    "get",
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );

  app.route(
    "get",
    "/auth/google/callback",
    passport.authenticate("google"),
    (req: Request, res: Response) => {
      res.redirect("/");
    }
  );

  app.route("get", "/logout", Auth.logOut);

  // Check to see if a user is logged in or not
  app.route("post", "/auth", Auth.isLoggedIn);

  // ------------------------------------------------ //
  // ************ URL ROUTES ************* //
  // ------------------------------------------------ //

  // Return the list of urls user has shortened
  app.route("get", "/url", middlewares.requireAuth, Url.getUrls);

  // Get the url, shorten it and save to database
  app.route(
    "post",
    "/url",
    middlewares.isValidURL,
    middlewares.checkRealUrlExistence,
    Url.shorten
  );

  // Redirect to the real url
  app.route("get", "/:id", Url.redirect);

  // Delete an url record
  app.route(
    "delete",
    "/url/:id",
    middlewares.requireAuth,
    middlewares.checkUrlOwnership,
    Url.remove
  );
};
