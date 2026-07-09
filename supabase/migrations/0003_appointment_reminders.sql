-- EPILISSE: "your appointment is tomorrow" reminder emails, sent once per
-- appointment by the daily /api/cron/appointment-reminders job.

alter table appointments add column reminder_sent boolean not null default false;
