# EPILISSE — Product decisions log

Durable product/architecture rules that bind future work, newest last.
Format: ADR-number, status, one-line rationale. Feature-internal details belong
in the feature's spec, not here.

---

## ADR-001 — Supabase is the single source of truth for site content

**Status:** Proposed (2026-09-04) — pending the open questions in `Specification.md` §16.
**Context:** All admin-editable content except the theme lived in per-browser
`localStorage`, so an admin edit was invisible to every other device and to the
deployed site; confirmed live when a category created locally did not exist on
`epilisse.vercel.app`.

**Decision:**
1. Any content an admin can edit is stored in Supabase and read server-side; the
   browser is never the source of truth for anything a visitor sees.
2. New editable content follows the theme pattern: table with RLS enabled, a
   single public `select` policy, writes only through a route handler under
   `src/app/api/**` that calls `getAdminSession()` and uses the service-role key.
3. A missing content row is a valid state meaning "use the code default" —
   default copy lives in TypeScript, never duplicated into SQL seeds.
4. CMS content tables are named distinctly from the booking/CRM tables
   (`site_content`, not `categories`/`campaigns`, which already exist and mean
   something else). DB names stay English regardless of the German UI.
5. Every CMS category must also exist as a row in the `categories` table, because
   `appointments.category_id` references it; those rows are never deleted.

**Rationale:** the admin panel is only a CMS if its edits reach real visitors;
the theme editor already proved the pattern in production.

**Supersedes / makes stale:** the comments in `0001_init.sql` ("prices live in
the Behandlungen localStorage layer") and `0018_theme_settings.sql` ("hero slides
and page copy remain browser-local admin state").
