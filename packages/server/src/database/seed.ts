import { Pool } from "pg";
import fs from "fs";
import path from "path";
import keys from "../config/keys.js";
import { LINKS } from "../lib/links.js";

// Create the database if it doesn't exist
async function createDatabase() {
  const adminPool = new Pool({
    user: keys.dbUser,
    host: keys.dbHost,
    database: "postgres", // default DB
    password: keys.dbPassword,
    port: keys.dbPort,
  });

  const result = await adminPool.query(
    `
    SELECT 1 FROM pg_database WHERE datname = $1
  `,
    [keys.dbDatabase]
  );

  if (result.rowCount === 0) {
    await adminPool.query(`CREATE DATABASE ${keys.dbDatabase};`);
    console.log(`[postgres] created database: ${keys.dbDatabase}`);
  }

  await adminPool.end();
}

await createDatabase();

const pool = new Pool({
  user: keys.dbUser as string,
  host: keys.dbHost as string,
  database: keys.dbDatabase as string,
  password: keys.dbPassword as string,
  port: keys.dbPort as number,
});

// Test the database connection
try {
  const client = await pool.connect();
  console.log(`[postgres] connected to database: ${keys.dbDatabase}`);
  client.release();
} catch (err) {
  console.error("[postgres] database connection failed:", err);
  process.exit(1);
}

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
  const ultraCodesTableSQL: string = fs
    .readFileSync(path.join(databasePath, "./tables/ultra_codes.sql"))
    .toString();
  const digitCodesTableSQL: string = fs
    .readFileSync(path.join(databasePath, "./tables/digit_codes.sql"))
    .toString();
  const usernamesTableSQL: string = fs
    .readFileSync(path.join(databasePath, "./tables/usernames.sql"))
    .toString();

  // Grab the triggers sql file
  const triggersSQL: string = fs
    .readFileSync(path.join(databasePath, "./triggers.sql"))
    .toString();

  try {
    // Drop all our tables
    console.log("\nDropping the tables...");
    await pool.query("DROP TABLE IF EXISTS ultra_codes");
    console.log("[postgres] ultra_codes table was dropped.");
    await pool.query("DROP TABLE IF EXISTS digit_codes");
    console.log("[postgres] digit_codes table was dropped.");
    await pool.query("DROP TABLE IF EXISTS urls");
    console.log("[postgres] urls table was dropped.");
    await pool.query("DROP TYPE IF EXISTS link_type_enum");
    console.log("[postgres] link_type_enum type was dropped.");
    await pool.query("DROP TABLE IF EXISTS users");
    console.log("[postgres] users table was dropped.");
    await pool.query("DROP TABLE IF EXISTS sessions");
    console.log("[postgres] sessions table was dropped.");
    await pool.query("DROP TABLE IF EXISTS usernames");
    console.log("[postgres] usernames table was dropped.");

    // Execute the sql file to create our tables
    console.log("\nCreating the tables...");
    await pool.query(usersTableSQL);
    console.log("[postgres] users table was created successfully.");
    await pool.query(sessionsTableSQL);
    console.log("[postgres] sessions table was created successfully.");
    await pool.query(urlsTableSQL);
    console.log("[postgres] urls table was created successfully.");
    await pool.query(ultraCodesTableSQL);
    console.log("[postgres] ultra_codes table was created successfully.");
    await pool.query(digitCodesTableSQL);
    console.log("[postgres] digit_codes table was created successfully.");
    await pool.query(usernamesTableSQL);
    console.log("[postgres] usernames table was created successfully.");

    // Execute the sql file to fire up our triggers
    console.log("\nSetting up the triggers...");
    await pool.query(triggersSQL);
    console.log("[postgres] triggers were fired up successfully.");
  } catch (err) {
    console.error(err);
  }

  // ----------------------------------
  //     POPULATING ULTRA CODES TABLE
  // ----------------------------------
  console.log("\nAdding ultra codes...");
  const letters = LINKS.ultra.characters;

  // Insert all 1-character codes
  await pool.query(
    `
    INSERT INTO ultra_codes (code)
    SELECT substr($1, g, 1)
    FROM generate_series(1, length($1)) AS g;
  `,
    [letters]
  );

  // Insert all 2-character codes
  await pool.query(
    `
    INSERT INTO ultra_codes (code)
    SELECT substr($1, g1, 1) || substr($1, g2, 1)
    FROM generate_series(1, length($1)) AS g1,
         generate_series(1, length($1)) AS g2;
  `,
    [letters]
  );

  console.log(
    `[postgres] ${
      (await pool.query("SELECT COUNT(*) FROM ultra_codes")).rows[0].count
    } records (${letters.length} one-character & ${
      letters.length * letters.length
    } two-character ultra codes) were added to the database.`
  );
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
