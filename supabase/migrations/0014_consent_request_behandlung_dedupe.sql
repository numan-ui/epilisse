-- EPILISSE: separate same-day dedupe for the Behandlungseinwilligung request,
-- so a newly-surfaced Laser consent requirement (e.g. an admin books a Laser
-- appointment for a customer who was only ever asked for Datenschutz) can go
-- out immediately even if a non-Behandlung consent request already fired
-- today — the two are tracked independently.

alter table customers add column consent_request_behandlung_sent_at timestamptz;
