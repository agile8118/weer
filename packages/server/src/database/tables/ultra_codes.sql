-- # NOTE: Scratch file – experimental pseudocode, not finalized. Please ignore for now.

-- These are the ultra short codes, 1-2 characters long only, case insensitive, no o or 0 to avoid confusion
-- They expire after 30 minutes
create table if not exists ultra_codes (
  id
  code varchar(2) primary key,
  url_id -- id from the urls table
  assigned_at timestamptz not null default now(),
  expires_at timestamptz not null
);