-- URLS TABLE
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  real_url VARCHAR(2200) NOT NULL, -- original URL
  shortened_url_id VARCHAR(80), -- short code for the shortened URL that users see
  qr_code_id VARCHAR(10) DEFAULT NULL UNIQUE, -- short code for QR code only

  -- Owner can be a registered user OR an anonymous session
  user_id INT,
  session_id INT,

  -- If a user has chosen a code to be on their username [like weer.pro/joe/whatever] this will be true
  is_on_username BOOLEAN DEFAULT FALSE,

  views INT DEFAULT 0, -- change this so that we have our own views table that saves ip address, user agent, referrer, timestamp etc
  updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE
  SET NULL,
    CONSTRAINT chk_owner CHECK (
      (
        user_id IS NOT NULL
        AND session_id IS NULL
      )
      OR (
        user_id IS NULL
        AND session_id IS NOT NULL
      )
    )
);

-- Ensure a record cannot have the same shortened_url_id more than once if it's not on a username
CREATE UNIQUE INDEX unique_global_url_code
  ON urls (shortened_url_id)
  WHERE is_on_username = FALSE;
