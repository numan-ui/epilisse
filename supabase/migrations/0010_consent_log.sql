-- EPILISSE: DSGVO audit trail. The customers.consent_*_at columns only hold
-- the current state (and get overwritten/nulled on withdrawal), so this table
-- is the append-only proof of when/how each consent was granted or withdrawn —
-- needed to demonstrate compliance, not just to drive app logic.

create type consent_kind as enum ('datenschutz', 'behandlung', 'marketing');
create type consent_action as enum ('granted', 'withdrawn');

create table consent_log (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  kind        consent_kind not null,
  action      consent_action not null,
  source      text not null, -- 'booking' | 'einwilligung_link' | 'admin'
  created_at  timestamptz not null default now()
);
create index consent_log_customer_idx on consent_log (customer_id, created_at desc);

alter table consent_log enable row level security;
