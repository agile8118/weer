-- Each record represents a view of a shortened URL
CREATE TABLE IF NOT EXISTS views (
  id SERIAL PRIMARY KEY,
  url_id INT NOT NULL,
  
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  visitor_hash CHAR(64),

  link_type link_type_enum NOT NULL, -- the type of the link when it was viewed

  -- Optional, if we do IP geolocation:
  country VARCHAR(100),
  city VARCHAR(100),
  
  
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_url FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
);
