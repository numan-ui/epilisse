-- EPILISSE: separate CTA colour for theme_settings.
--
-- Design fix: nav CTA, FAQ tabs, and package-card buttons all shared
-- --color-primary, so the booking action didn't visually stand out from
-- navigation/selection elements. Booking CTAs now read a dedicated
-- cta_color/cta_hover pair (src/lib/theme/derive.ts). Backfilled from the
-- existing brand/brand_hover so Gold Lux and Antique Rose render unchanged.

alter table theme_settings
  add column cta_color text,
  add column cta_hover text;

update theme_settings
  set cta_color = brand, cta_hover = brand_hover
  where cta_color is null;

alter table theme_settings
  alter column cta_color set not null,
  alter column cta_hover set not null;
