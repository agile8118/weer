SET timezone TO 'GMT';
-- CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(200),
  google_id VARCHAR(200),
  email VARCHAR(200),
  name VARCHAR(200),
  password VARCHAR(200),
  verified BOOLEAN,

  username_id, -- a user can have up to 4 usernames, only one is active and the rest expire in 30 days

  link_count INTEGER DEFAULT 0, -- number of URLs user has shortened. Includes deleted links and customization.

  token_code VARCHAR(200),
  token_date TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (username),
  UNIQUE (email)
);