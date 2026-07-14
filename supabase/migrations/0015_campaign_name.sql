-- Internal campaign name (e.g. "Sommerfest", "Weihnachten Rabatt"), distinct
-- from `title` which is the actual email subject line sent to customers.
alter table campaigns add column name text;
