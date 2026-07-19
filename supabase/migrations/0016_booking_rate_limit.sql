-- EPILISSE: generic per-IP rate limiting for public endpoints prone to abuse
-- (booking spam / calendar DoS, unmetered password-reset notification spam).

create table rate_limit_attempts (
  id         uuid primary key default gen_random_uuid(),
  action     text not null,
  ip         text not null,
  created_at timestamptz not null default now()
);
create index rate_limit_attempts_action_ip_created_at_idx on rate_limit_attempts (action, ip, created_at);

alter table rate_limit_attempts enable row level security;
