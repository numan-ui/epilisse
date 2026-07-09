-- EPILISSE: two new transactional email kinds sharing the existing daily quota —
-- appointment confirmations (manually sent by admin) and consent-request emails
-- (auto-sent when a customer is missing mandatory Datenschutz/Behandlung consent).

alter table email_sends drop constraint if exists email_sends_kind_check;
alter table email_sends add constraint email_sends_kind_check
  check (kind in ('follow_up', 'appointment_reminder', 'campaign', 'appointment_confirmation', 'consent_request'));
