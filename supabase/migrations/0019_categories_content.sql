-- EPILISSE: categories content — draft/publish, DB-backed.
--
-- The admin's category list (name/icon/desc/image/order/visibility) has been
-- browser-localStorage-only, which meant admin edits never reached any other
-- browser or device — including production. This table makes it DB-backed,
-- with an explicit draft -> publish step: admin edits always write to
-- `draft`; the public site (in production) and any other visitor always read
-- `published`. A local dev server (CONTENT_PREVIEW=1 in .env.local) reads
-- `draft` instead, so the real pages can be previewed before publishing.
-- Single row, id = 1. Both columns start null, meaning "no override yet" —
-- callers fall back to the hardcoded CATEGORIES defaults in
-- src/app/[locale]/admin/behandlungen/data.ts, identical to today's
-- fresh-browser behaviour.

create table site_categories_content (
  id           smallint primary key default 1,
  draft        jsonb,
  published    jsonb,
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  constraint site_categories_content_singleton check (id = 1)
);

alter table site_categories_content enable row level security;

-- The public site reads `published` with the anon key during SSR
-- (src/lib/content/categories.ts -> getServerCategories).
create policy "site_categories_content public read"
  on site_categories_content for select
  using (true);

-- Writes (draft save + publish) go through /api/categories with the
-- service-role key, gated on an admin session in the route handler;
-- service-role bypasses RLS, so no insert/update policy is defined here.

insert into site_categories_content (id, draft, published) values (1, null, null);
