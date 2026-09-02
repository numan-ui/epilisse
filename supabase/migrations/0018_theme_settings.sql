-- EPILISSE: site theme (brand colours).
--
-- This is the one piece of *site content* that is DB-backed and served to
-- every visitor — hero slides and page copy remain browser-local admin state.
-- Single row, id = 1. The eight columns map to the admin colour pickers; the
-- full ~40 CSS custom properties are derived from them at render time
-- (src/lib/theme/derive.ts).

create table theme_settings (
  id          smallint primary key default 1,
  brand       text not null,
  on_brand    text not null,
  brand_hover text not null,
  surface     text not null,
  card        text not null,
  body_text   text not null,
  accent      text not null,
  hero_panel  text not null,
  updated_at  timestamptz not null default now(),
  constraint theme_settings_singleton check (id = 1)
);

alter table theme_settings enable row level security;

-- The public site reads the active theme with the anon key during SSR
-- (src/app/[locale]/layout.tsx → getServerTheme).
create policy "theme_settings public read"
  on theme_settings for select
  using (true);

-- Writes go through PUT /api/theme with the service-role key, gated on an
-- admin session in the route handler; service-role bypasses RLS, so no
-- insert/update policy is defined here.

-- Seed with the "Gold Lux" preset (identical to globals.css @theme). While the
-- saved row equals this preset the layout injects no override <style>.
insert into theme_settings
  (id, brand, on_brand, brand_hover, surface, card, body_text, accent, hero_panel)
values
  (1, '#745B00', '#FFFFFF', '#C5A021', '#FCF9F8', '#F0EDED', '#1C1B1B', '#A3A4A4', '#1A1712');
