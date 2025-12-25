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
  // The function will generate a new session token, save it to the database, and send it as a cookie to the client
  const generateSessionToken = async () => {
    const sessionToken = crypto.randomBytes(16).toString("hex"); // 128 bits

    await DB.query(`INSERT INTO sessions (session_token) VALUES ($1)`, [
      sessionToken,
    ]);

    req.session.session_token = sessionToken; // automatically is signed and set as cookie
  };

  if (req.user) {
    interface UserWithUsernames {
      email: string;
      usernames: { value: string; expires_at: Date | null; active: boolean }[];
    }

    const user = await DB.find<UserWithUsernames>(
      `SELECT 
        users.email, 
        COALESCE(
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'value', usernames.username, 
            'expires_at', usernames.expires_at,
            'active', usernames.active
          )
        ) FILTER (WHERE usernames.username IS NOT NULL), '[]') AS usernames
      FROM users
      LEFT JOIN usernames ON users.id = usernames.user_id 
      WHERE users.id = $1
      GROUP BY users.id`,
      [req.user.id]
    );

    console.log(user);

    if (user && user.email) {
      return res.json({
        isSignedIn: true,
        email: user.email,
        usernames: user.usernames,
      });
    } else {
      // Something went wrong, log the user out
      req.logout();
      return res.json({ isSignedIn: false });
    }
  } else {
    let sessionToken = req.session?.session_token;

    // User doesn't have a session token
    if (!sessionToken) {
      await generateSessionToken();
    } else {
      /* User do have a session token, but we don't know yet if it's valid or expired */

      // Check if the supplied session token exists and not expired
      const session = await DB.find<ISession>(
        `SELECT id FROM sessions WHERE session_token = $1 AND expires_at > NOW()`,
        [sessionToken]
      );

      if (session) {
        // If session exists and it valid, update last_active
        await DB.query(
          `UPDATE sessions SET last_active = NOW() WHERE session_token = $1`,
          [sessionToken]
        );
      } else {
        // If session doesn't exist, create a new one
        await generateSessionToken();
      }
    }

    res.json({ isSignedIn: false });
  }
};

export default { logOut, checkAuthStatus, login };
