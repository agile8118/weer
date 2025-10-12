import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";
import crypto from "crypto";

import { DB } from "../database/index.js";
import { IUser, ISession } from "../database/types.js";

const login = async (req: Request, res: Response) => {
  // ---- Migrate any urls created during the session to the user account ---- //
  const userId = req.user.id;
  const sessionToken = req.session.session_token; // from cookie

  const session = await DB.find<ISession>(
    `SELECT id FROM sessions WHERE session_token = $1`,
    [sessionToken]
  );

  if (session) {
    const sessionId = session.id;

    await DB.query(
      `UPDATE urls SET user_id = $1, session_id = NULL WHERE session_id = $2`,
      [userId, sessionId]
    );
  }

  res.redirect("/");
};

const logOut = (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
};

// If user is logged in, return their info (email, username) else return false
const checkAuthStatus = async (req: Request, res: Response) => {
  if (req.user) {
    const user = await DB.find<IUser>(
      `SELECT email, username FROM users WHERE id=${req.user.id}`
    );

    if (user && user.email) {
      return res.json({
        isSignedIn: true,
        email: user.email,
        username: user.username,
      });
    }
  } else {
    let sessionToken = req.session?.session_token;

    if (!sessionToken) {
      sessionToken = crypto.randomBytes(16).toString("hex"); // 128 bits

      await DB.query(`INSERT INTO sessions (session_token) VALUES ($1)`, [
        sessionToken,
      ]);

      req.session.session_token = sessionToken; // automatically is signed and set as cookie
    }

    await DB.query(
      `UPDATE sessions SET last_active = NOW() WHERE session_token = $1`,
      [sessionToken]
    );

    res.json({ isSignedIn: false });
  }
};

export default { logOut, checkAuthStatus, login };
