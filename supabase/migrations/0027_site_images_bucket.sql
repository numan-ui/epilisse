-- EPILISSE: public Storage bucket for admin-uploaded images.
--
-- Before this, ImageUpload.tsx (admin CMS) base64-encoded every uploaded
-- image straight into the site_content JSONB columns (FileReader.readAsDataURL).
-- That bloated `site_content` to ~900KB/row and got embedded into every page's
-- SSR HTML (RSC payload), driving LCP well past 10s on mobile. Uploads now go
-- through POST /api/upload-image (admin-gated, service-role key) to this
-- bucket instead, and the CMS stores a public URL.
--
-- Applied manually via MCP execute_sql on 2026-09-15; this file documents it
-- for `supabase db diff`/local dev parity — running it again is a no-op.

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "site-images public read" on storage.objects;
create policy "site-images public read"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- Writes go through /api/upload-image with the service-role key (bypasses
-- RLS), gated on an admin session in the route handler — same pattern as
-- site_content (see 0022_site_content.sql). No insert/update policy needed.
