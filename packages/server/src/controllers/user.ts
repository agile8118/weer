import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";
import crypto from "crypto";

import { DB } from "../database/index.js";
import { IUser, ISession } from "../database/types.js";

const checkUsernameAvailability = async (req: Request, res: Response) => {
  const username = req.vars?.username;

  if (!username || typeof username !== "string") {
    return res
      .status(400)
      .json({ available: false, error: "Invalid username" });
  }

  // We use EXISTS to optimize the query since we only care about existence
  const [{ taken }] = await DB.query(
    `SELECT EXISTS(
      SELECT 1 FROM usernames WHERE username = $1
    ) as "taken"`,
    [username.toLowerCase()]
  );

  return res.status(200).json({
    available: !taken,
  });
};

export default { checkUsernameAvailability };
