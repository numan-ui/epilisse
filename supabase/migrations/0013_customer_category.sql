-- EPILISSE: admin-set "primary" category for a customer (e.g. Laser), used to
-- decide which consents to request when the customer is created. This is a
-- hint, not a restriction — the customer can still book any service/category.

alter table customers add column category text references categories(id);
