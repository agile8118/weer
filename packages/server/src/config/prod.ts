export default {
  domain: process.env.DOMAIN,
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  cookieKey: process.env.COOKIE_KEY,
  // Postgres
  dbUser: process.env.DB_USER,
  dbHost: process.env.DB_HOST,
  dbDatabase: process.env.DB_DATABASE,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: Number(process.env.DB_PORT),
};
