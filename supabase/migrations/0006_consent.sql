-- EPILISSE: DSGVO consent capture on customers. Null = not yet given
-- (including customers created before this migration); a timestamp means
-- consent was given at that time. The text of what was agreed to lives in
-- the linked Datenschutz / Behandlung pages (versioned via git history),
-- not duplicated in the database.

alter table customers add column consent_datenschutz_at timestamptz;
alter table customers add column consent_behandlung_at timestamptz;
alter table customers add column consent_marketing_at timestamptz;
