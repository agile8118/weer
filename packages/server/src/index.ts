import cpeak, { serveStatic, parseJSON, render } from "cpeak";
import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";

import path from "path";
import passport from "passport";
import cookieSession from "cookie-session";
import compression from "compression";
// import expressSession from "express-session";
import helmet from "helmet";

import log from "./lib/log.js";
import keys from "./config/keys.js";
import apiRouter from "./router.js";

import "./passport.js";

const app = new cpeak();

// For parsing JSON body
app.beforeEach(parseJSON);

// express session
// app.beforeEach(
//   expressSession({
//     secret: "jhfweufiewhkjfweihfweifhwkjhkjhfiweh976tgu",
//   }) as any
// );

const port = Number(process.env.PORT || 2080);

// app.beforeEach(helmet());
app.beforeEach(compression() as any);

const publicPath = new URL("../public", import.meta.url).pathname;
app.beforeEach(serveStatic(publicPath));

// For sever side rendering
app.beforeEach(render());

if (!keys.cookieKey || keys.cookieKey.length < 32) {
  console.log(
    "You must set a cookie key in config/keys.ts file and it must be at least 32 characters long."
  );
  process.exit(1);
}

app.beforeEach(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    keys: [keys.cookieKey],
  }) as any
);

// Passport authentication
app.beforeEach(passport.initialize() as any);
app.beforeEach(passport.session());

app.beforeEach((req, res, next) => {
  const requestStart = Date.now();
  // Grab requester ip address
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // Once the request is finished
  res.on("finish", () => {
    // Get req status code and message
    const { statusCode, statusMessage } = res;
    // Calculate how much it took the request to finish
    const processingTime = Date.now() - requestStart;

    // Format the log message and send it to log function
    log(
      ip +
        " -- " +
        req.method +
        " " +
        req.url +
        " " +
        statusCode +
        " " +
        statusMessage +
        " -- response-time: " +
        processingTime +
        " ms"
    );
  });
  next();
});

// Show the home page
app.route("get", "/", (req: Request, res: Response) => {
  res.sendFile(path.join(publicPath, "./index.html"), "text/html");
});

// ------ API Routes ------ //
apiRouter(app);

/*

// Send 404 page
app.get("*", (req, res) => {
  res.sendFile("404.html", { root: __dirname + "/../public" });
});

*/

// Handle all the errors that could happen in the routes
app.handleErr((error: any, req: Request, res: Response) => {
  if (error && error.status) {
    res.status(error.status).json({ error: error.message });
  } else {
    // if (error.code === "CPEAK_ERR_FILE_NOT_FOUND") {
    //   return res.status(404).json({ error: "File not found." });
    // }

    console.error("An unexpected error happened.");
    log(error);

    res.status(500).json({
      error: "Sorry, something unexpected happened from our side.",
    });
  }
});

const server = app.listen(port, () => {
  log(
    "Starting the server..." +
      "\n----------------------------------\n" +
      "Server has started on port " +
      port +
      "\n----------------------------------"
  );
  console.log("Server is on port " + port);
});

// Export the server for testing
export { server };
