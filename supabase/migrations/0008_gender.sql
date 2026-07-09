-- EPILISSE: customer gender/salutation (Herr/Frau/Keine Angabe), shown in admin
-- Kunden UI and usable for "Liebe/r" salutation logic later. Defaults to
-- 'keine_angabe' so existing rows (created before this migration) don't need
-- backfilling.

create type customer_gender as enum ('herr', 'frau', 'keine_angabe');

alter table customers add column gender customer_gender not null default 'keine_angabe';
