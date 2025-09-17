import prod from "./prod.js";
import dev from "./dev.js";
const config = process.env.NODE_ENV === "production" ||
    (process.env.NODE_ENV === "test" && process.env.DOMAIN)
    ? prod
    : dev;
export default config;
//# sourceMappingURL=keys.js.map