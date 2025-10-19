-- These are the ultra short codes, 1-2 characters long only, case insensitive, no o or l to avoid confusion
-- They expire after 30 minutes of assignment
create table if not exists ultra_codes (
  id SERIAL PRIMARY KEY,
  code varchar(2) UNIQUE NOT NULL, -- the ultra code itself
  url_id INT UNIQUE DEFAULT NULL,-- id from the urls table
  assigned_at timestamptz DEFAULT NULL,
  expires_at timestamptz DEFAULT NULL, -- should be 30 minutes after assigned_at
  CONSTRAINT fk_url FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE SET NULL
);