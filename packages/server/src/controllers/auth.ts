import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";

import { DB } from "../database/index.js";
import { IUser } from "../database/types.js";

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
  }

  res.json({ isSignedIn: false });
};

export default { logOut, checkAuthStatus };
