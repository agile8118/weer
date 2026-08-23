import type { CpeakRequest as Request } from "cpeak";

export interface Util {
  isValidUrlId(id: string | number): boolean;
  getClientIp(req: Request): string | null;
}

function isValidUrlId(id: string | number): boolean {
  /** @TODO make sure all code types are validated */
  return true;
}

function getClientIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = raw ? raw.split(",")[0].trim() : "";
  return ip || req.socket.remoteAddress || null;
}

const util: Util = {
  isValidUrlId,
  getClientIp,
};

export default util;
