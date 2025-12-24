import type { CpeakRequest as Request, CpeakResponse as Response } from "cpeak";
import crypto from "crypto";

import { DB } from "../database/index.js";
import { IUser, ISession } from "../database/types.js";

const isUsernameAvailable = async (username: string): Promise<boolean> => {
  // We use EXISTS to optimize the query since we only care about existence
  const [{ taken }] = await DB.query(
    `SELECT EXISTS(
      SELECT 1 FROM usernames WHERE username = $1
    ) as "taken"`,
    [username.toLowerCase()]
  );

  return !taken;
};

// Checks if a username is available
const checkUsernameAvailability = async (req: Request, res: Response) => {
  const username = req.vars?.username;

  if (!username || typeof username !== "string") {
    return res
      .status(400)
      .json({ available: false, error: "Invalid username" });
  }

  const available = await isUsernameAvailable(username);

  return res.status(200).json({
    available,
  });
};

// Updates the user's username
const updateUsername = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const newUsername = req.body?.username;

  if (!newUsername || typeof newUsername !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }

  // Check if username is already taken
  const available = await isUsernameAvailable(newUsername);

  if (!available) {
    return res.status(409).json({ error: "Username is already taken" });
  }

  // Get the user's current active username
  const currentUsernameRecord = await DB.find<IUser>(
    `SELECT username FROM usernames WHERE user_id = $1 AND active = true`,
    [userId]
  );

  const oldUsername = currentUsernameRecord
    ? currentUsernameRecord.username
    : null;

  /*
  // We only keep 3 inactive usernames per user. If the user already has 3 inactive usernames, delete 
  // the one that is set to expire the soonest
  const inactiveUsernames = await DB.find<IUser>(
    `SELECT username FROM usernames WHERE user_id = $1 AND active = false ORDER BY expires_at ASC`,
    [userId]
  );

  // if (inactiveUsernames.length >= 3) {
  // }
  */

  // Deactivate the existing username for the user and set expires_at one month from now
  await DB.query(
    `UPDATE usernames SET active = false, expires_at = NOW() + INTERVAL '1 month' WHERE user_id = $1 AND username = $2`,
    [userId, oldUsername]
  );

  // Insert the new username
  await DB.query(
    `INSERT INTO usernames (user_id, username, active) VALUES ($1, $2, true)`,
    [userId, newUsername.toLowerCase()]
  );

  return res.status(200).json({ message: "Username updated successfully" });
};

export default { checkUsernameAvailability, updateUsername };
