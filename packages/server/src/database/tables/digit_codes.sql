-- # NOTE: Scratch file – experimental pseudocode, not finalized. Please ignore for now.

-- for 3 up to 5 digit codes

create table if not exists digit_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(5) UNIQUE NOT NULL, -- the digit code itself
  url_id INT UNIQUE DEFAULT NULL,-- id from the urls table
  code_length INT, -- either 3, 4 or 5
  assigned_at timestamptz DEFAULT NULL,
  expires_at timestamptz DEFAULT NULL,
  CONSTRAINT fk_url FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE SET NULL
);

-- For creating a new digit code
-- select 1 from digit_codes where expires_at > now() order by code;


-- If more than 700, it means we are reaching entropy and we should move to 4 digit codes to avoid tons of collisions
-- select count(*) from digit_codes where code_length = 3;