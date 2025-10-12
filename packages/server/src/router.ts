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
    }),
    (req: Request, res: Response) => {}
  );

  app.route(
    "get",
    "/auth/google/callback",
    passport.authenticate("google"),
    Auth.login
  );

  app.route("get", "/logout", Auth.logOut);

  // Check to see if a user is logged in or not. Return user data if logged in
  app.route("get", "/auth/status", Auth.checkAuthStatus);

  // ------------------------------------------------ //
  // ************ URL ROUTES ************* //
  // ------------------------------------------------ //

  // Return the list of urls user has shortened
  app.route("get", "/url", Url.getUrls);

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
  app.route("delete", "/url/:id", middlewares.checkUrlOwnership, Url.remove);
};
