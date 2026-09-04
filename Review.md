# Red-team review — `Specification.md` (site content CMS: localStorage → Supabase)

Reviewer: red-team · Date: 2026-09-04 · Target: `Specification.md` (Draft) + `DECISIONS.md` ADR-001
Scope: adversarial only. No alternative designs, no fixes proposed, no code changed.
Calibration: solo operator, one salon site, Vercel + Supabase free/low tier, ~one content editor.
Enterprise-grade concerns that don't bite at this scale are listed in §4 as explicitly dismissed, not silently skipped.

Verdict: **the design is directionally right and the theme pattern is the correct thing to copy — but it was copied from a 200-byte singleton row onto a potentially multi-megabyte blob, and the autosave model plus the "no versioning, no undo, no backup" non-goals combine into a realistic, silent, unrecoverable data-loss path.** Four blocking findings.

---

## 1. Blocking

### B1 — `no-store` SSR read of *all* documents on *every* request, with base64 images inside them

The spec copies `getServerTheme()`'s `cache: 'no-store'` behaviour verbatim (§5, §18: "caching/ISR tuning is a non-goal, `no-store` matches the theme"). That is safe for `theme_settings`, which is one row of eight hex strings. It is not the same decision for `site_content`.

Break scenario, entirely ordinary usage:
The owner uploads a hero photo, an "Über Uns" photo and one category tile straight from her phone. `startseite/page.tsx:80-82`, `einstellungen/page.tsx:426-428` and `behandlungen/[categoryId]/page.tsx:580-582` all do a bare `FileReader.readAsDataURL(file)` — **there is no client-side size check anywhere**. A 2.5 MB phone JPEG becomes a ~3.3 MB base64 string inside the document. Three of those and the site is carrying ~10 MB of content documents.

Now every single request to the site — the homepage, `/impressum`, a Googlebot crawl, a 404, the admin login page, all of which sit under `[locale]/layout.tsx` — performs `select content_key, value from site_content` with no cache and pulls all ~10 MB out of Supabase, then serializes the whole object into the RSC payload of the returned HTML so the client provider can hydrate it.

Consequences, all of them new (today those base64 blobs live in one browser's localStorage and never touch a visitor):
- Supabase egress: at ~10 MB/request, the 5 GB/month free-tier egress budget is gone at roughly **500 page views**. This is a per-visitor cost that scales linearly with visitors — the exact class of cost problem that keeps recurring across these projects.
- TTFB: the server layout now blocks on a multi-MB download before it can emit a byte.
- Page weight: the Impressum page ships every category's hero image, in base64, in the HTML.

The spec **already knows this** — §12 Phase 3: *"in the DB it means multi-MB JSONB documents fetched on every SSR request, which will hurt TTFB well before it hurts storage"* — and then instructs "**Do not start Phase 3 inside this spec's work**", leaving "the size caps in §9 are the guard rail". A 3 MB per-document cap is not a guard rail against this; 3 MB per document *is* the failure. As written, Phase 2 is not shippable to production traffic.

Severity: **blocking**. Not because of an exotic edge case — because the first thing a salon owner does with a CMS is upload photos.

### B2 — Stale-tab overwrite: silent, total, unrecoverable

Three spec decisions stack badly:
- §6.1: debounced autosave, no explicit save button.
- §8.3: "First save materializes the whole document" — one edited field writes the *entire* merged document.
- §8.10 + §18: last-write-wins, no optimistic locking, no versioning, no undo, no audit trail beyond `updated_at`.

Break scenario:
Monday, the owner leaves `/de/admin/behandlungen/laser` open on the salon laptop. Tuesday, from her phone, she updates six prices. Wednesday, she wakes the laptop; the still-mounted tab holds Monday's snapshot of the `services` document. She fixes one typo in one field. 800 ms later, `queueSave('services', <Monday's whole document>)` fires a `PUT` and Tuesday's six price changes are gone. The UI shows "Kaydedildi". There is no history, no `updated_at` precondition on the write, and Supabase's free tier has no point-in-time recovery. The content is simply gone, and the only person who could notice is the person who just destroyed it.

§8.10 dismisses this as *"Two admins editing the same section concurrently... Accepted for now (single editor in practice)"*. That framing is wrong: **this is one editor with two tabs**, which is the normal case for a laptop + phone owner, not a multi-editor exotic. Autosave makes it strictly worse than the theme's explicit "Kaydet", because with an explicit button the stale tab only overwrites when the user *intends* to save. Here, focusing a stale tab and typing one character is enough.

Severity: **blocking**. The spec's own §11.1 correctly calls silent+irreversible content loss out as a risk for the migration, then designs a permanent version of the same risk into steady-state operation.

### B3 — `router.refresh()` and provider state resync are unspecified, and it's the hinge the whole thing turns on

§6.1 step 1: initial state comes from `useSiteContent()`. §6.1 "Post-save freshness": after a save, `router.refresh()` so "every other surface... is consistent".

`router.refresh()` re-runs the server layout and re-renders `SiteContentProvider` with a new value. It does **not** re-initialize `useState` inside `AdminDataProvider`. So exactly one of two things is true, and the spec picks neither:

- If `AdminDataProvider` seeds `useState` from the context value and never resyncs: the admin's editing state is frozen at page-load time forever. This is precisely the mechanism that makes B2 fire, and `router.refresh()` achieves nothing for the surface that matters — only for sibling server components.
- If it *does* resync from the context on every refresh: then a refresh landing mid-typing (its own post-save refresh, or one triggered by navigation) will clobber the admin's in-progress local edits with the server value.

The spec asserts the benefit ("every other surface is consistent") without specifying the rule that produces it. This is the single most load-bearing under-specification in the document — it decides whether the feature loses data.

Severity: **blocking** (as under-specification; it must be resolved before implementation, not during).

### B4 — R1 does not close the booking FK bug; it narrows it and adds a silent failure mode

§7, `PUT /api/content` behaviour: *"Log and 200 anyway if this side-upsert fails (content save must not be blocked by CRM bookkeeping), but include `"categorySyncWarning": string` in the response."*

Break scenario:
The categories document saves; the `categories`-table upsert fails (RLS/service-role hiccup, transient network, a name violating a constraint). The API returns **200**. The admin sees "Kaydedildi". `router.refresh()` runs. The new category goes live on the public site. Nothing in the spec requires the admin UI to render `categorySyncWarning` — it is defined in the response shape and never mentioned again in §6.1's save-status model (`'idle' | 'saving' | 'saved' | 'error'`), §14's state table, or §17's acceptance criteria.

A real customer then books it. `src/app/api/book/route.ts` does, in order: rate-limit, validate, check overlap, **create the customer row** (line 96-111), **write consent events** (126-129), **send the consent-confirmation email** (131-146), and only *then* insert the appointments (159-163) — which is where the FK to `categories(id)` blows up. Result: an orphan customer row, consent-log entries, a confirmation email sitting in the customer's inbox for an appointment that does not exist, and a raw Postgres FK error string returned verbatim to the browser (`apptError.message`).

The spec calls R1 the thing that "fixes the FK bug in §1.4 **permanently**" (§4.2). It doesn't. It makes it rarer and moves the failure from "always, loudly, at category creation" to "occasionally, silently, at a customer's booking attempt". The spec also never requires `POST /api/book` to validate that `categoryId` exists before it starts writing rows and sending mail.

Severity: **blocking**. The stated purpose of R1 is to stop bookings failing; the spec's own fallback path lets bookings fail in a worse way.

---

## 2. Should-fix

### S1 — R1 makes the "stale `body`/`inject`/`andere` rows" leak self-replicating, on a surface the spec didn't check

§16's closing note flags that the DB `categories` table still holds `body`, `inject`, `andere` and that admin pickers "may still surface them", then puts it out of scope. Two things the spec missed while doing so:

1. `src/app/api/categories/route.ts` is the feed for those pickers, and it is **completely unauthenticated** — no `getAdminSession()`, no session check of any kind. It is a public GET returning every category id and name, `order('name')`.
2. R1's "rows are **never deleted** there" rule (correct, for FK integrity) combined with CMS deletion means the set now **grows without bound**. Every `cat-*` the owner creates and later deletes leaves a permanent row that reappears in the Kampagnen and Termine pickers.

Break scenario: the owner trials "Permanent Make Up", deletes it two weeks later. Next month she builds an email campaign and picks "Permanent Make Up" from the still-populated category dropdown (`kampagnen/page.tsx:60`). The campaign targets a category that no longer exists on the site, matches whatever historical customers happen to carry that `category` value, and there is nothing in the UI saying the category is dead. The spec explicitly labels this leak as pre-existing and out of scope while the change it introduces is what turns it from three fixed rows into an ever-growing list.

### S2 — Admin-created categories get no `category_follow_up_settings` row; follow-up automation silently never works for them

`0001_init.sql:52-61` creates `category_follow_up_settings` with `category_id text primary key references categories(id) on delete cascade` and seeds it **once**, `select id from categories`. R1 upserts into `categories` only.

Consequences, both silent:
- `GET /api/follow-up-settings` lists rows of `category_follow_up_settings`, so a new `cat-*` category never appears in the Follow-Up settings UI at all. The owner cannot enable follow-up reminders for it and gets no indication why.
- `PATCH /api/follow-up-settings` is a bare `.update(...).eq('category_id', ...)` — updating zero rows is not an error in PostgREST, so it returns `{ ok: true }` for a category that has no row.
- `api/cron/follow-up/route.ts` iterates `category_follow_up_settings where enabled = true`, so the new category is never even considered.

R1 as specified fixes one FK relationship and ignores the second table that hangs off the same key. Nothing in §4.2, §7, §8 or §17 mentions it.

### S3 — SEO/structured-data surfaces still read the hardcoded defaults after Phase 2

`src/components/LocalBusinessSchema.tsx` line 1 imports `INIT_SETTINGS` and line 15 uses it directly. It is rendered in the `<head>` of the **same** `[locale]/layout.tsx` this spec is modifying. After Phase 2, the visible Kontakt/footer blocks show the DB-edited phone, address and opening hours while the JSON-LD keeps emitting the placeholder `+49 89 000000` and the hardcoded street address/postal code. For a local business, publishing two conflicting sets of NAP data is actively harmful, and it becomes true the instant Phase 2 ships.

Same class, same blind spot: `src/app/sitemap.ts` is a static map over `SEO_ROUTES` — admin-created `cat-*` pages, which are *the entire point of this specification*, are never in the sitemap. §17.1 accepts the fix as done when the category "appears on `/de/behandlungen` and its `/de/cat-<id>` page renders", which will pass while the page remains undiscoverable.

Neither file is mentioned in §6, §12, §17 or §19.

### S4 — "Flush on `beforeunload`" is not a guarantee, and it fails hardest exactly where it matters

§6.1 step 3: *"Flush immediately on `visibilitychange: hidden`, `beforeunload`, and on provider unmount."* Stated as if it were reliable. Browsers cancel in-flight `fetch` on unload unless `keepalive: true` is set, and `keepalive` request bodies are capped at **64 KB**. Any `page_content`, `settings`, `hero_slides` or `categories` document carrying a base64 image is one to two orders of magnitude over that cap.

Break scenario: the admin uploads a category photo and closes the tab within the 800 ms window. The flush either never leaves the browser or is rejected for exceeding the keepalive body limit. The upload — the most annoying single thing to redo — is silently lost. The narrow-body case (a text edit) mostly works; the wide-body case, which is the one users care about, never does.

### S5 — Logout discards pending edits, and the error banner unmounts with them

`src/app/[locale]/admin/layout.tsx:52-56`: `handleLogout` calls `supabase.auth.signOut()` then `router.push('/admin/login')`. On the login route the layout returns `<>{children}</>` (line 39-41), which unmounts `AdminDataProvider` entirely.

Break scenario: the admin types, then clicks the logout icon within 800 ms. The unmount flush the spec specifies fires *after* the session has already been destroyed → 401 → and the "Oturum sona erdi" banner §9 promises lives in the component that just unmounted. Nothing is shown, nothing is saved. This directly contradicts business rule §8.12 ("Save failures never silently discard input") on the single most predictable exit path from the admin panel. The spec's flush trigger list doesn't include sign-out.

### S6 — One admin racing themselves: overlapping in-flight PUTs, no sequencing

Debounce is 800 ms. A 2 MB `PUT` over a salon's upstream link takes considerably longer than 800 ms. The admin keeps typing → `PUT#2` is dispatched while `PUT#1` is still in flight. Nothing in §6.1, §7 or §8 cancels the earlier request, orders them, or guards the write with an `updated_at` precondition. Whichever transaction commits last wins, and it can be the older one. Then `router.refresh()` — fired on `PUT#2`'s success — reads back `PUT#1`'s content, and per B3 either does nothing or clobbers the local state with older data.

§8.10 reasons about last-write-wins *between admins* and concludes it's acceptable because there's only one. It never considers a single admin's own concurrent requests, which is the case that will actually occur, daily.

### S7 — Batched PUT has no per-document isolation; one oversized image bricks saving for everything

§6.1 step 3 coalesces every dirty key into one request body. §9 rejects at request granularity (400 or 413 for the whole call).

Break scenario: the admin uploads a 5 MB image into `page_content` and, in the same editing burst, corrects a service price. One `PUT` carries both documents. Server returns 413. **Neither** is saved — including the price edit that was perfectly valid. The oversized image is still sitting in client state, so every subsequent autosave repeats the same 413, forever. The banner (§9) names "an uploaded image that is too large" but doesn't say which one, in which section, and there is no per-document retry. The only escape is to reload the page and lose every unsaved edit in the session. §8.12's "save failures never silently discard input" holds for one keystroke and breaks for a whole session.

### S8 — The 4 MB body cap sits above Vercel's own limit, so the spec's 413 handler will rarely be what fires

§9 sets "Whole request body ≤ **4 MB**". Vercel's serverless request body limit is ~4.5 MB and the platform rejects oversized bodies **before the route handler runs**, returning `FUNCTION_PAYLOAD_TOO_LARGE` as an HTML/plain-text error page. The client's error path (`res.json()` on a non-200) will throw a JSON parse error instead of surfacing the spec's `{"error": "İçerik çok büyük (max <n> MB)"}`. Choosing 4 MB deliberately places the app's cap in the band where the platform preempts the app, so the carefully-worded German/Turkish 413 message is largely dead code and the real user-visible failure is an unhandled parse error.

### S9 — `GET /api/content` and the RSC payload publish content the owner deliberately hid — §17.14 asserts the opposite

Every content type carries a visibility flag and, per §6, **the filtering happens in the hooks, client-side**: `useAdminReviews` → `content.reviews.filter(r => r.active)`, `useAdminServices` → filter `active`, `Category` has `visible: boolean` (`data.ts:6`), `Campaign` has `active`. The API returns the raw merged documents and the SSR provider serializes the same raw documents into the RSC payload of every public page.

So `curl /api/content` (public, unauthenticated by design, §7) or plain view-source returns: deactivated services with their old prices, hidden categories with their full page copy and ids, unpublished Treatwell reviews, and inactive campaign cards. Note also that `[slug]/page.tsx:27` matches on id only and never checks `visible`, so once the ids are publicly enumerable, every hidden category page is directly reachable.

Acceptance criterion §17.14 — *"`GET /api/content` works anonymously and **exposes nothing beyond public page copy**"* — is false as designed and will be signed off as passing by anyone who only checks that no secrets appear. Not catastrophic for a salon, but "the old price we deliberately turned off is in the page source" is a real customer-facing embarrassment, and the spec claims immunity it doesn't have.

### S10 — §11.3's rollback claim is only true before the first edit

*"Revert the app deploy... No data loss on rollback."* True at t=0. False the moment any content has been edited: after a rollback the code reads localStorage again, the new code already cleared those keys, so **the live public site instantly reverts to code defaults** and every edit the owner made since the migration disappears from visitors' view. The data is still in `site_content`, but there is no path back to rendering it short of a manual re-paste, and the spec documents none.

A rollback plan is read exactly once — under pressure, during an incident. Stating "no data loss" without the "only if nothing was edited" qualifier is how a bad decision gets made at the worst possible moment.

### S11 — The §11.1 backfill is all-or-nothing and will very likely 400 on the first attempt

Two independent traps:

1. §9 constrains category ids to built-in (`laser`/`gesicht`/`mani`) or `^cat-\d+$`. Any browser used for admin work before 2026-07-14 / commit `77a168e` will have `andere`, `body` and/or `inject` in its exported `epilisse_admin_categories` — the spec itself notes those categories were removed. Pasting that export straight into `PUT /api/content` (which §11.1 says the shapes allow) fails 400 for the **entire request**, with an error naming the key but not the offending element. The operator, working in a console at deploy time, has no way to tell what's wrong.
2. The export snippet uses a bare `JSON.parse(localStorage[k])` inside a `.map()`. One corrupt or truncated key throws and yields **nothing at all** — no partial output, no indication which key failed.

Also: the same stale keys (`body`, `inject`, `andere`) will appear as keys of the `services` / `campaigns` / `page_content` maps, and §9 validates category-id shape only for the `categories` document — so those orphan map keys are accepted, persisted, and never cleaned up.

Finally: Q1 is labelled **blocking**, but §19 Definition of Done contains no gate requiring that the export was captured or that the user explicitly waived it. It is entirely possible to complete every DoD item and still have silently destroyed the owner's content.

### S12 — Phase 1 mixed mode + the legacy-key cleanup is stated twice with different scopes

§6, in the general change list: *"on mount, `AdminDataProvider` removes the ten `epilisse_admin_*` keys from `localStorage` once... One-liner, no UI."* No phase qualifier.
§12 Phase 2: *"Ends with zero `localStorage` reads/writes for content in `src/`, plus the legacy-key cleanup."*

During Phase 1, six of those ten keys are still the live storage for `settings`, `landing_content`, `hero_slides`, `promo_banners`, `about_values` and `reviews`. If an implementer follows §6 literally in Phase 1 — which reads as a general instruction, and the phrase "one-liner" actively encourages doing it early — the first admin page load wipes the owner's hero slides and contact settings. The spec creates the trap by describing the same action twice at two different scopes.

---

## 3. Worth noting, low priority at this scale

- **W1 — `updated_by` is publicly readable.** `create policy ... for select using (true)` covers every column. The anon key is in the client bundle, so anyone can `select * from site_content` and read the admin's `auth.users` UUID plus every edit timestamp. Internal identifier + activity metadata, not exploitable on its own. Low.
- **W2 — JSONB rewrite churn.** Repeated full-document rewrites of multi-MB TOASTed rows produce dead tuples and bloat. Autovacuum handles it; the only real exposure is free-tier disk. Low **unless B1 goes unresolved**, in which case it compounds.
- **W3 — `/api/categories` orders alphabetically** (`.order('name')`), contradicting business rule §8.6 ("category ordering is never alphabetical") for the admin pickers. Cosmetic, admin-only surface.
- **W4 — id collisions.** `addCategory` mints `cat-${Date.now()}` and cloned services `s-${Date.now()}-${i}`. Two adds within the same millisecond collide, and §9's id-uniqueness validator would then 400 with an error the admin cannot interpret. Practically unreachable with one human clicking.
- **W5 — Soft-404 becomes server-rendered.** Deleting the `hydrated` gate in `[slug]/page.tsx` means "Seite nicht gefunden" renders server-side with HTTP 200 for every unmatched path — pre-existing, but SSR makes it index-worthy. The spec presents the deletion as a pure simplification.
- **W6 — Timer/listener cleanup.** Debounce timers plus `visibilitychange`/`beforeunload` listeners; §6.1 specifies unmount flush. Considered; no real leak risk in a single-operator admin panel.

---

## 4. Considered and explicitly dismissed — not overlooked, deprioritized

- **Traffic scale (100x / 1000x).** Irrelevant *as traffic*. A single Munich salon site will not see it, and adding a second Supabase round trip to an already-dynamic request is genuinely cheap. The scale risk in this spec is **per-request payload size, not request volume** — see B1. Do not read B1 as a traffic concern.
- **Third-party API rate limits.** This feature calls no external API. Supabase PostgREST imposes nothing a salon site can approach with text documents. Not a risk.
- **AI call cost / timeouts / retries on AI.** No AI in this feature. N/A. (The recurring per-user AI cost concern from other projects does not apply here; the cost vector is egress, B1.)
- **Payment, idempotency of money operations.** No payment path touched.
- **GDPR / privacy / retention on `site_content`.** Contents are public marketing copy plus one admin UUID. No customer personal data, no DSAR surface, no retention obligation. The repo's real GDPR surface is `customers` / `consent_log` / the consent-token flow, none of which this spec touches. Dismissed as a genuine non-issue — with the caveat that S9 is a *content-exposure* finding, not a privacy one.
- **SQL injection.** All writes go through parameterized supabase-js calls; no string-built SQL anywhere in the change. Admin content is rendered as text, and the only `dangerouslySetInnerHTML` in the layout is theme CSS and `JSON.stringify`d JSON-LD. An admin defacing their own site is not a threat model at this scale.
- **RLS privilege escalation.** The policy design is correct and I could not break it. Only a `select` policy exists, so Supabase's default `anon`/`authenticated` grants are neutralized by RLS for all write verbs; writes go through the service-role key behind `getAdminSession()` in a route handler, which `authServer.ts` correctly documents as mandatory. Treating `admin` and `super_admin` as equal for content is a defensible call for a 1-2 person salon. No finding beyond W1.
- **Deadlock on concurrent multi-row upserts.** Theoretically possible if two transactions order the same rows differently; both clients build the array from the same code path, so ordering is deterministic. Not realistic here.
- **External abuse / malicious users.** The only unauthenticated surfaces are `GET /api/content` and `GET /api/categories`, both read-only with no write path reachable by an anon user. The one realistic abuse is egress amplification by hammering `/api/content` once images are inline, which folds into B1 rather than standing as a separate finding. No CAPTCHA/rate-limit recommendation at this scale.

---

## 5. Open questions in §16 — my read

- **Q1 (baseline/export).** The spec is right to flag it blocking, but see **S11**: the export procedure as written will probably fail on first use, and **the DoD has no gate enforcing that it happened**. The question being answered is not sufficient; the answer has to be enforceable.
- **Q2 (autosave vs explicit save).** The spec's stated reason for autosave is implementation convenience ("preserves those pages byte-for-byte and confines the diff to the context"). Every one of B2, S4, S5, S6 and S7 exists because of that choice. That is not a reason to reject it, but the spec presents autosave as the low-risk option and it is the opposite; the trade-off is understated.
- **Q3 (Option A).** Fine at this scale for the reasons given. The consequence the spec doesn't spell out: with a single JSONB blob per key there is **no partial update** — every save rewrites the whole document, which is what makes B2 total rather than field-scoped, and what makes S7's batching failure so wide. Option A is defensible; the "there is exactly one content editor, so document-level last-write-wins is acceptable" justification is not, per B2.
- **Q4 (R1).** Recommended and correct in direction, insufficient as specified — see B4, S1, S2.
- **Q5 (base64 images through Phases 1-2).** This is the one recommendation I would call outright wrong. See B1.
- **Q6 (string language).** No risk. Genuinely a coin flip.

---

## 6. What I would refuse to sign off

`Specification.md` §17's acceptance criteria will pass a tester agent while B1, B2, B4, S1, S2, S3 and S9 are all live in production — several of them *because* the criteria assert the wrong thing (§17.14) or check the shallow version of the right thing (§17.1 vs the sitemap). The acceptance list is the weakest section of an otherwise thorough document: it verifies that the happy path works, and almost nothing about what happens when it doesn't.
