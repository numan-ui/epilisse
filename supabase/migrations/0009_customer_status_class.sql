-- EPILISSE: soft deactivate customers (instead of deleting) + A/B/C/D
-- customer class for segmentation, so campaigns can later target by class
-- in addition to the existing tags (VIP/Stammkundin/Neukundin).

alter table customers add column is_active boolean not null default true;

create type customer_class as enum ('A', 'B', 'C');
alter table customers add column class customer_class;
