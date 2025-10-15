-- # NOTE: Scratch file – experimental pseudocode, not finalized. Please ignore for now.

-- for 3 up to 5 digit codes

create table if not exists digit_codes (
  id
  code varchar(5) primary key,
  url_id -- id from the urls table
  length int -- either 3, 4 or 5
  assigned_at timestamptz not null default now(),
  expires_at timestamptz not null
);

-- For creating a new digit code
select 1 from digit_codes where expires_at > now() order by code;


-- If more than 700, it means we are reaching entropy and we should move to 4 digit codes to avoid tons of collisions
select count(*) from digit_codes where length === 3;