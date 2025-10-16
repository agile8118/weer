import type {
  Cpeak,
  CpeakRequest as Request,
  CpeakResponse as Response,
  HandleErr,
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

  // Get the url, shorten it and save to database
  app.route("post", "/url", middlewares.isValidURL, Url.shorten);

  // Return the list of urls user has shortened
  app.route("get", "/url", Url.getUrls);

  // Redirect to the real url
  app.route("get", "/:id", Url.redirect);

  // Send a QR code image for a link
  app.route("get", "/qr/:id", middlewares.checkUrlOwnership, Url.sendQrCode);

  interface IParams {
    filter: string;
    test: string;
  }

  interface IBody {
    url?: string;
    name: number;
    username: string;
    id: string;
    extra: string;
    test?: string;
    another?: number;
  }
  // Redirect to the real url that were created with a username
  // @TODO: make sure 'qr' counts as a taken username
  app.route(
    "get",
    "/:username/:id",
    (req: Request<IBody, IParams>, res: Response, handleError: HandleErr) => {
      req.vars?.username; // forget about this, it will always be string
      console.log(req.params.test); // user has to define this as IParams
      req.body?.url; // user has to define this as IBody
    }
  );

  // Delete a url record
  app.route("delete", "/url/:id", middlewares.checkUrlOwnership, Url.remove);
};
