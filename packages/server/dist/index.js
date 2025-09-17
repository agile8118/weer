import cpeak, { serveStatic, parseJSON, render } from "cpeak";
import path from "path";
import passport from "passport";
import cookieSession from "cookie-session";
import compression from "compression";
import log from "./lib/log.js";
import keys from "./config/keys.js";
import apiRouter from "./router.js";
import "./passport.js";
const app = new cpeak();
app.beforeEach(parseJSON);
const port = Number(process.env.PORT || 2080);
app.beforeEach(compression());
const publicPath = new URL("../public", import.meta.url).pathname;
app.beforeEach(serveStatic(publicPath));
app.beforeEach(render());
if (!keys.cookieKey || keys.cookieKey.length < 32) {
    console.log("You must set a cookie key in config/keys.ts file and it must be at least 32 characters long.");
    process.exit(1);
}
app.beforeEach(cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: [keys.cookieKey],
}));
app.beforeEach(passport.initialize());
app.beforeEach(passport.session());
app.beforeEach((req, res, next) => {
    const requestStart = Date.now();
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    res.on("finish", () => {
        const { statusCode, statusMessage } = res;
        const processingTime = Date.now() - requestStart;
        log(ip +
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
            " ms");
    });
    next();
});
app.route("get", "/", (req, res) => {
    res.sendFile(path.join(publicPath, "./index.html"), "text/html");
});
apiRouter(app);
app.handleErr((error, req, res) => {
    if (error && error.status) {
        res.status(error.status).json({ error: error.message });
    }
    else {
        console.error(error);
        res.status(500).json({
            error: "Sorry, something unexpected happened from our side.",
        });
    }
});
const server = app.listen(port, () => {
    log("Starting the server..." +
        "\n----------------------------------\n" +
        "Server has started on port " +
        port +
        "\n----------------------------------");
    console.log("Server is on port " + port);
});
export { server };
//# sourceMappingURL=index.js.map