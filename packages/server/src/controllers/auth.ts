import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";

import { DB } from "../database.js";

const logOut = (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
};

// Check to see if a user is logged in or not
const isLoggedIn = async (req: Request, res: Response) => {
  if (req.user) {
    const { email } = await DB.find(
      `SELECT email FROM users WHERE id=${req.user.id}`
    );
    return res.json({ isSignedIn: true, email });
  }
  res.json({ isSignedIn: false });
};

export default { logOut, isLoggedIn };
