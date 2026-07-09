-- EPILISSE: manual "close this time slot" blocks (e.g. bookings that came in
-- through Treatwell or another external channel, lunch breaks, time off) —
-- not tied to a customer/appointment, but still block the online booking
-- calendar's availability the same way a real appointment would.

create table blocked_slots (
  id           uuid primary key default gen_random_uuid(),
  starts_at    timestamptz not null,
  duration_min integer not null default 30,
  reason       text not null default '',
  created_at   timestamptz not null default now()
);
create index blocked_slots_starts_at_idx on blocked_slots (starts_at);

alter table blocked_slots enable row level security;
