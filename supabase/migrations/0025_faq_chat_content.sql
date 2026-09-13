-- EPILISSE: FAQ chatbot content — draft/publish, DB-backed, same singleton
-- pattern as site_categories_content / site_content.
--
-- No LLM, no embeddings: the public chat widget matches a visitor's question
-- against these entries with plain keyword scoring (src/lib/faq/match.ts).
-- Admin edits one free-text box per category, using "F: ...\nA: ..." blocks
-- (parsed in src/lib/faq/parseFaqChat.ts) rather than a per-row CRUD form —
-- easiest to paste/maintain a long FAQ list from. Shape stored in both jsonb
-- columns: Record<categoryId, string> (categoryId matches CATEGORIES[].id,
-- plus 'general' for questions not tied to one treatment category).

create table faq_chat_content (
  id           smallint primary key default 1,
  draft        jsonb,
  published    jsonb,
  updated_at   timestamptz not null default now(),
  published_at timestamptz,
  constraint faq_chat_content_singleton check (id = 1)
);

alter table faq_chat_content enable row level security;

-- The public site reads `published` with the anon key during SSR
-- (src/lib/content/faqChat.ts -> getServerFaqChatContent).
create policy "faq_chat_content public read"
  on faq_chat_content for select
  using (true);

-- Writes (draft save + publish) go through /api/faq-chat with the
-- service-role key, gated on an admin session in the route handler;
-- service-role bypasses RLS, so no insert/update policy is defined here.

insert into faq_chat_content (id, draft, published) values (1, null, null);
