import cpeak, { serveStatic, parseJSON, render } from "cpeak";

// For development: ../../cpeak/lib/index.js

import path from "path";
import passport from "passport";
import cookieSession from "cookie-session";
import compression from "compression";
import helmet from "helmet";
import log from "./lib/log.js";
import keys from "./config/keys.js";
import apiRouter from "./router.js";

import "./passport.js";

const server = new cpeak();

// For parsing JSON body
server.beforeEach(parseJSON);

const port = process.env.PORT || 2080;

server.beforeEach(helmet());
server.beforeEach(compression());

const publicPath = new URL("../public", import.meta.url).pathname;
server.beforeEach(serveStatic(publicPath));

// For sever side rendering
server.beforeEach(render());

server.beforeEach(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    keys: [keys.cookieKey],
  })
);

// Passport authentication
server.beforeEach(passport.initialize());
server.beforeEach(passport.session());

server.beforeEach((req, res, next) => {
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
        req.originalUrl +
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
server.route("get", "/", (req, res) => {
  res.sendFile(path.join(publicPath, "./index.html"), "text/html");
});

// ------ API Routes ------ //
apiRouter(server);

/*

// Send 404 page
app.get("*", (req, res) => {
  res.sendFile("404.html", { root: __dirname + "/../public" });
});

*/

// Handle all the errors that could happen in the routes
server.handleErr((error, req, res) => {
  if (error && error.status) {
    res.status(error.status).json({ error: error.message });
  } else {
    console.error(error);
    res.status(500).json({
      error: "Sorry, something unexpected happened from our side.",
    });
  }
});

server.listen(port, () => {
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
