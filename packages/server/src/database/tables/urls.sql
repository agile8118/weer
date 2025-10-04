-- CREATE URLS TABLE
CREATE TABLE IF NOT EXISTS urls (
  id SERIAL PRIMARY KEY,
  real_url VARCHAR(2200) NOT NULL,
  shortened_url_id VARCHAR(100) NOT NULL,
  user_id INT,
  views INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);