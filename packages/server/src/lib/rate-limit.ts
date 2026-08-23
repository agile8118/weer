import type { CpeakRequest as Request } from "cpeak";
import { DB } from "../database/index.js";
import util from "./util.js";

const USER_LIFETIME_LIMIT = 100;
const IP_BURST_LIMIT = 10; // per 10 minutes

async function enforceUserLimit(userId: number): Promise<void> {
  const row = await DB.find<{ link_credits: number }>(
    `UPDATE users SET link_credits = link_credits - 1 WHERE id = $1 RETURNING link_credits`,
    [userId]
  );

  if ((row?.link_credits ?? 0) < 0) {
    throw {
      status: 402,
      message:
        "You've used all your credits. Please contact support to increase your limit for free.",
    };
  }
}

async function enforceIpLimit(ip: string): Promise<void> {
  const row = await DB.find<{ burst_count: number }>(
    `
    INSERT INTO rate_limits (ip_address, burst_count, burst_reset_at)
    VALUES ($1, 1, now())
    ON CONFLICT (ip_address) DO UPDATE SET
      burst_count = CASE WHEN rate_limits.burst_reset_at < now() - interval '10 minutes' THEN 1 ELSE rate_limits.burst_count + 1 END,
      burst_reset_at = CASE WHEN rate_limits.burst_reset_at < now() - interval '10 minutes' THEN now() ELSE rate_limits.burst_reset_at END
    RETURNING burst_count
    `,
    [ip]
  );

  if ((row?.burst_count ?? 0) > IP_BURST_LIMIT) {
    throw {
      status: 429,
      message: "Too many requests. Please try again later.",
    };
  }
}

export async function enforceRateLimit(req: Request): Promise<void> {
  if (req.user) return enforceUserLimit(req.user.id);

  const ip = util.getClientIp(req);
  if (!ip) return; // no derivable IP (shouldn't happen for a real connection)

  return enforceIpLimit(ip);
}
