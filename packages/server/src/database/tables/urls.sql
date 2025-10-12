-- CREATE URLS TABLE
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  real_url VARCHAR(2200) NOT NULL,
  shortened_url_id VARCHAR(100) NOT NULL,

  -- Owner can be a registered user OR an anonymous session
  user_id INT,
  session_id INT,

  views INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL,
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