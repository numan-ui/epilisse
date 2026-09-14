-- Admin on/off switch for the FAQ chatbot widget, independent of the
-- draft/publish content flow — flips instantly, no "Veröffentlichen" needed.
-- See src/app/api/faq-chat/route.ts (PATCH) and src/app/[locale]/admin/faq-bot.

alter table faq_chat_content add column enabled boolean not null default true;
