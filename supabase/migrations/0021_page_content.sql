-- EPILISSE: service-page content (Seiteninhalt) — draft/publish, DB-backed.
--
-- Same story as 0019_categories_content.sql, for the per-category page copy:
-- hero label/H1/description/image, the info title + two paragraphs, the
-- benefits list, and the two campaign banners. This was browser-localStorage
-- only, so an admin's Seiteninhalt edits (including an uploaded hero image)
-- never reached any other browser, device, or production.
--
-- One JSONB blob per column holding the whole PageContentMap
-- (Record<categoryId, PageContent>), exactly the shape of INIT_PAGE_CONTENT in
-- src/app/[locale]/admin/behandlungen/data.ts plus any admin-added category
-- keys. Admin edits always write `draft`; production reads `published`; a
-- local dev server with CONTENT_PREVIEW=1 reads `draft`. Both columns start
-- null → callers fall back to the hardcoded INIT_PAGE_CONTENT defaults,
-- identical to today's fresh-browser behaviour.

create table site_page_content (
  id           smallint primary key default 1,
  draft        jsonb,
  published    jsonb,
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  constraint site_page_content_singleton check (id = 1)
);

alter table site_page_content enable row level security;

-- The public site reads `published` with the anon key during SSR
-- (src/lib/content/pageContent.ts -> getServerPageContent).
create policy "site_page_content public read"
  on site_page_content for select
  using (true);

-- Writes (draft save + publish) go through /api/page-content with the
-- service-role key, gated on an admin session in the route handler;
-- service-role bypasses RLS, so no insert/update policy is defined here.

insert into site_page_content (id, draft, published) values (1, null, null);
