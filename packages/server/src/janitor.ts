/**
 * This code will run in a separate process to clean up expired codes and perform other maintenance tasks.
 * Our main app will run in cluster mode on many servers. But only one instance of janitor should be running at any time.
 */

import { DB } from "./database/index.js";

// Clean up expired digit codes every 5 minutes
const cleanUpExpiredDigitCode = async () => {
  const result = await DB.query(
    `DELETE FROM digit_codes WHERE expires_at < NOW();`
  );

  if (result.rowCount > 0)
    console.log(`[janitor] cleaned up ${result.rowCount} expired digit codes.`);
};

setInterval(() => {
  cleanUpExpiredDigitCode();
}, 5 * 60 * 1000); // 5 minutes in milliseconds

// Initial cleanup on startup
cleanUpExpiredDigitCode();
