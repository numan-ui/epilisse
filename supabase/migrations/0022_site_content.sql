-- EPILISSE: remaining site content — draft/publish, DB-backed.
--
-- Completes the migration started by 0019 (categories) and 0021 (Seiteninhalt):
-- everything else the admin panel edits was browser-localStorage only and so
-- never reached other devices or production. This single JSONB blob per column
-- holds all of it, keyed exactly like the old localStorage keys:
--
--   { services:       Record<categoryId, Service[]>,
--     campaigns:      Record<categoryId, Campaign[]>,
--     settings:       SiteSettings,
--     landingContent: LandingContent,
--     heroSlides:     HeroSlide[],
--     promoBanners:   PromoBanner[],
--     aboutValues:    AboutValue[],
--     reviews:        Review[] }
--
-- (shapes: src/app/[locale]/admin/behandlungen/data.ts). Admin edits write
-- `draft`; production reads `published`; a local dev server with
-- CONTENT_PREVIEW=1 reads `draft`. Both columns start null → callers fall back
-- to the hardcoded INIT_* defaults, identical to a fresh browser today.

create table site_content (
  id           smallint primary key default 1,
  draft        jsonb,
  published    jsonb,
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  constraint site_content_singleton check (id = 1)
);

alter table site_content enable row level security;

-- Public SSR read (anon key) — src/lib/content/site.ts -> getServerSiteContent.
create policy "site_content public read"
  on site_content for select
  using (true);

-- Writes (draft save + publish) go through /api/content with the service-role
-- key, gated on an admin session in the route handler; service-role bypasses
-- RLS, so no insert/update policy is defined here.

insert into site_content (id, draft, published) values (1, null, null);
