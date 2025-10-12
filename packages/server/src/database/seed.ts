import { Pool } from "pg";
import fs from "fs";
import path from "path";
import keys from "../config/keys.js";

const pool = new Pool({
  user: keys.dbUser as string,
  host: keys.dbHost as string,
  database: keys.dbDatabase as string,
  password: keys.dbPassword as string,
  port: keys.dbPort as number,
});

const databasePath = new URL("./", import.meta.url).pathname;

// Create triggers and tables
(async (): Promise<void> => {
  // Grab the tables sql file
  const usersTableSQL: string = fs
    .readFileSync(path.join(databasePath, "./tables/users.sql"))
    .toString();
  const urlsTableSQL: string = fs
    .readFileSync(path.join(databasePath, "./tables/urls.sql"))
    .toString();
  const sessionsTableSQL: string = fs
    .readFileSync(path.join(databasePath, "./tables/sessions.sql"))
    .toString();

  // Grab the triggers sql file
  const triggersSQL: string = fs
    .readFileSync(path.join(databasePath, "./triggers.sql"))
    .toString();

  try {
    // Drop all our tables
    console.log("\nDropping the tables...");
    await pool.query("DROP TABLE IF EXISTS urls");
    console.log("[postgres] urls table was dropped.");
    await pool.query("DROP TABLE IF EXISTS users");
    console.log("[postgres] users table was dropped.");
    await pool.query("DROP TABLE IF EXISTS sessions");
    console.log("[postgres] sessions table was dropped.");

    // Execute the sql file to create our tables
    console.log("\nCreating the tables...");
    await pool.query(usersTableSQL);
    console.log("[postgres] users table was created successfully.");
    await pool.query(sessionsTableSQL);
    console.log("[postgres] sessions table was created successfully.");
    await pool.query(urlsTableSQL);
    console.log("[postgres] urls table was created successfully.");

    // Execute the sql file to fire up our triggers
    console.log("\nSetting up the triggers...");
    await pool.query(triggersSQL);
    console.log("[postgres] triggers were fired up successfully.");
  } catch (err) {
    console.error(err);
  }
})();

// -----------------------
//     ADDING USERS
// -----------------------

// (async () => {
//   // Password of all the users will be simply 'string'
//   const hashedPassword = await bcrypt.hash("string", 10);

//   console.log("\nAdding some users data...");

//   pool.query(
//     `
//   INSERT INTO users (name, username, email, password, verified)
//   VALUES
//   ('Joseph H.', 'joseph', 'agile.8272@gmail.com', '${hashedPassword}', true),
//   ('Rogers Brown', 'rgGamer', 'pokhraph@gmail.com', '${hashedPassword}', true),
//   ('David Miller', 'davidChef', 'antwonders@gmail.com', '${hashedPassword}', true)
//   `,
//     (err, res) => {
//       if (err) return console.log(err);
//       console.log(
//         "[postgres] 3 users were added to the database with the password 'string'."
//       );

//       // pool.end();
//     }
//   );
// })();
