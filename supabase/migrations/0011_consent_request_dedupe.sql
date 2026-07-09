-- EPILISSE: track the last time a consent-request email went to a customer,
-- so creating the customer and then booking their first appointment minutes
-- later doesn't fire the same "please confirm consent" email twice in a day.

alter table customers add column consent_request_last_sent_at timestamptz;
