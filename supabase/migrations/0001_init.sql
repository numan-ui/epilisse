-- EPILISSE: Kunden/Termine/Kampanyalar/Follow-Up real data model.
-- Run in the Supabase SQL editor (or `supabase db push` once the CLI is linked).

create extension if not exists pgcrypto; -- gen_random_uuid()

create table categories (
  id         text primary key,
  name       text not null,
  created_at timestamptz not null default now()
);

insert into categories (id, name) values
  ('laser',   'Laser-Haarentfernung'),
  ('gesicht', 'Gesichtsästhetik'),
  ('body',    'Body Contouring'),
  ('inject',  'Injectables'),
  ('mani',    'Maniküre'),
  ('andere',  'Andere');

create table customers (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text,
  email      text,
  since      date not null default current_date,
  tags       text[] not null default '{}',
  notes      text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_email_idx on customers (lower(email));

create type appointment_status as enum ('confirmed', 'pending', 'cancelled');

create table appointments (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references customers(id) on delete cascade,
  category_id  text not null references categories(id),
  service_name text not null,
  price        numeric(10,2), -- snapshot of what was charged; nullable since Services/prices live in the Behandlungen localStorage layer, not this DB
  starts_at    timestamptz not null,
  duration_min integer not null default 30,
  status       appointment_status not null default 'confirmed',
  notes        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index appointments_customer_idx on appointments (customer_id, starts_at desc);
create index appointments_category_idx on appointments (category_id, starts_at desc);
create index appointments_starts_at_idx on appointments (starts_at);

create table category_follow_up_settings (
  category_id             text primary key references categories(id) on delete cascade,
  enabled                 boolean not null default false,
  renewal_interval_weeks  integer not null default 4,
  reminder_lead_days      integer not null default 14,
  updated_at              timestamptz not null default now()
);

insert into category_follow_up_settings (category_id)
  select id from categories;

create type campaign_target_type as enum ('all', 'category', 'customers');

create table campaigns (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  message             text not null,
  discount_label      text,
  target_type         campaign_target_type not null,
  target_category_id  text references categories(id),
  status              text not null default 'draft',
  created_at          timestamptz not null default now(),
  sent_at             timestamptz
);

create type recipient_status as enum ('pending', 'sent', 'failed');

create table campaign_recipients (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  status      recipient_status not null default 'pending',
  sent_at     timestamptz,
  error       text,
  unique (campaign_id, customer_id)
);
create index campaign_recipients_campaign_idx on campaign_recipients (campaign_id);

create table follow_up_reminders (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null references customers(id) on delete cascade,
  category_id    text not null references categories(id),
  appointment_id uuid not null references appointments(id) on delete cascade,
  sent_at        timestamptz not null default now(),
  unique (customer_id, category_id, appointment_id)
);

-- Most-recent non-cancelled appointment per customer within a category.
-- Used by the nightly follow-up cron (api/cron/follow-up) — DISTINCT ON isn't
-- expressible through the supabase-js query builder, so it's called via .rpc().
create function latest_appointments_by_category(p_category_id text)
returns table (appointment_id uuid, customer_id uuid, starts_at timestamptz)
language sql stable
as $$
  select distinct on (customer_id) id as appointment_id, customer_id, starts_at
  from appointments
  where category_id = p_category_id and status != 'cancelled'
  order by customer_id, starts_at desc;
$$;

-- The app only ever talks to these tables through server-side route handlers
-- using the Supabase service-role key (which bypasses RLS). Enabling RLS with
-- zero policies blocks the anon/authenticated keys from ever touching them,
-- so there is no browser-facing access path to lock down separately.
alter table categories                    enable row level security;
alter table customers                     enable row level security;
alter table appointments                  enable row level security;
alter table category_follow_up_settings   enable row level security;
alter table campaigns                     enable row level security;
alter table campaign_recipients           enable row level security;
alter table follow_up_reminders           enable row level security;
