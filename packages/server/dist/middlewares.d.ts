import type { RouteMiddleware } from "cpeak";
interface Middlewares {
    isValidURL: RouteMiddleware;
    checkRealUrlExistence: RouteMiddleware;
    checkUrlOwnership: RouteMiddleware;
    requireAuth: RouteMiddleware;
}
declare const middlewares: Middlewares;
export default middlewares;
