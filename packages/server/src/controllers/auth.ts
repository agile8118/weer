import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";

import { DB } from "../database/index.js";
import { IUser } from "../database/types.js";

const logOut = (req: Request, res: Response) => {
  req.logout();
  res.redirect("/");
};

// Check to see if a user is logged in or not
const isLoggedIn = async (req: Request, res: Response) => {
  if (req.user) {
    const user = await DB.find<IUser>(
      `SELECT email FROM users WHERE id=${req.user.id}`
    );

    if (user && user.email) {
      return res.json({ isSignedIn: true, email: user.email });
    }
  }

  res.json({ isSignedIn: false });
};

export default { logOut, isLoggedIn };
