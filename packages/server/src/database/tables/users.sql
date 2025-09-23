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
  token_code VARCHAR(200),
  token_date TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (username),
  UNIQUE (email)
);