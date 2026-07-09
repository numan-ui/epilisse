-- EPILISSE: shared daily email-send counter across follow-up reminders,
-- appointment reminders, and campaigns, so campaign sends never exceed
-- Resend's free-tier daily cap after reminders have already used some of it.

create table email_sends (
  id      uuid primary key default gen_random_uuid(),
  kind    text not null check (kind in ('follow_up', 'appointment_reminder', 'campaign')),
  sent_at timestamptz not null default now()
);
create index email_sends_sent_at_idx on email_sends (sent_at);

alter table email_sends enable row level security;
