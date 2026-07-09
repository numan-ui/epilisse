-- EPILISSE: email_sends only tracked *how many* of each kind went out today
-- (for the quota), not *who* got them — so "when did you send me this?" had
-- no answer beyond Resend's own dashboard. Add customer + recipient so every
-- send is traceable back to a specific person.

alter table email_sends add column customer_id uuid references customers(id) on delete set null;
alter table email_sends add column recipient text;
create index email_sends_customer_idx on email_sends (customer_id, sent_at desc);
