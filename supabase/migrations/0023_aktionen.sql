-- EPILISSE: unify homepage promo banners + per-category campaigns into one
-- `aktionen` array on site_content. See
-- docs/superpowers/specs/2026-09-07-aktionen-subsystem-design.md.
--
-- Runtime code already reads legacy keys via deriveAktionen(); this migration
-- makes the stored blobs match the new shape so the live site does not wait for
-- a fresh "Veröffentlichen". Idempotent: blobs that already carry `aktionen`
-- are skipped.

create or replace function pg_temp.epilisse_to_aktionen(blob jsonb)
returns jsonb language plpgsql as $$
declare
  result jsonb := '[]'::jsonb;
  cat text;
  cmp jsonb;
  pb jsonb;
begin
  if blob is null or jsonb_typeof(blob) <> 'object' then
    return blob;
  end if;
  if blob ? 'aktionen' then
    return blob;  -- already migrated
  end if;

  -- per-category campaigns
  if blob ? 'campaigns' and jsonb_typeof(blob->'campaigns') = 'object' then
    for cat in select jsonb_object_keys(blob->'campaigns') loop
      for cmp in select * from jsonb_array_elements(blob->'campaigns'->cat) loop
        result := result || jsonb_build_object(
          'id',    cmp->>'id',
          'category', cat,
          'label', coalesce(cmp->>'label',''),
          'title', coalesce(cmp->>'title',''),
          'desc',  coalesce(cmp->>'desc',''),
          'price', coalesce(cmp->>'price',''),
          'oldPrice', cmp->>'oldPrice',
          'cta',   coalesce(cmp->>'cta','JETZT BUCHEN'),
          'icon',  coalesce(cmp->>'icon','auto_fix_high'),
          'image', coalesce(cmp->>'image',''),
          'imagePosition', cmp->>'imagePosition',
          'activeInCategory', coalesce((cmp->>'active')::boolean, true),
          'activeOnHome', false
        );
      end loop;
    end loop;
  end if;

  -- homepage promo banners
  if blob ? 'promoBanners' and jsonb_typeof(blob->'promoBanners') = 'array' then
    for pb in select * from jsonb_array_elements(blob->'promoBanners') loop
      result := result || jsonb_build_object(
        'id',    pb->>'id',
        'category', 'laser',
        'label', coalesce(pb->>'label',''),
        'title', coalesce(pb->>'title',''),
        'desc',  coalesce(pb->>'desc',''),
        'price', '',
        'cta',   coalesce(nullif(pb->>'ctaPrimary',''),'JETZT BUCHEN'),
        'icon',  'auto_awesome',
        'image', coalesce(pb->>'image',''),
        'activeInCategory', true,
        'activeOnHome', true
      );
    end loop;
  end if;

  return (blob - 'campaigns' - 'promoBanners') || jsonb_build_object('aktionen', result);
end;
$$;

update site_content
set draft      = pg_temp.epilisse_to_aktionen(draft),
    published  = pg_temp.epilisse_to_aktionen(published),
    updated_at = now()
where id = 1;
