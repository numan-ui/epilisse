-- EPILISSE: track admin password-reset notification emails against the same
-- shared daily quota as other transactional email kinds.

alter table email_sends drop constraint if exists email_sends_kind_check;
alter table email_sends add constraint email_sends_kind_check
  check (kind in ('follow_up', 'appointment_reminder', 'campaign', 'appointment_confirmation', 'consent_request', 'admin_password_reset'));
