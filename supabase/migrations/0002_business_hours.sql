-- EPILISSE: business hours moved from admin localStorage into the DB so
-- server-side availability/slot computation (/api/availability) can read them.
-- Run in the Supabase SQL editor (or `supabase db push` once the CLI is linked).

create table business_hours (
  weekday     smallint primary key check (weekday between 0 and 6), -- 0=Sonntag .. 6=Samstag, matches JS Date.getDay()
  day_label   text not null,
  open_time   time not null,
  close_time  time not null,
  closed      boolean not null default false,
  updated_at  timestamptz not null default now()
);

insert into business_hours (weekday, day_label, open_time, close_time, closed) values
  (1, 'Montag',     '09:00', '19:00', false),
  (2, 'Dienstag',   '09:00', '19:00', false),
  (3, 'Mittwoch',   '09:00', '19:00', false),
  (4, 'Donnerstag', '09:00', '20:00', false),
  (5, 'Freitag',    '09:00', '20:00', false),
  (6, 'Samstag',    '10:00', '17:00', false),
  (0, 'Sonntag',    '10:00', '16:00', true);

alter table business_hours enable row level security;
