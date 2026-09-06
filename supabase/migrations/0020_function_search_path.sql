-- Security Advisor: "Function Search Path Mutable" on
-- latest_appointments_by_category (defined in 0001_init.sql). Without a pinned
-- search_path, a caller who sets their own search_path could make the
-- unqualified `appointments` reference resolve to a shadowing object in
-- another schema. Pin it to empty and schema-qualify the table. Body is
-- otherwise identical to the original.

create or replace function latest_appointments_by_category(p_category_id text)
returns table (appointment_id uuid, customer_id uuid, starts_at timestamptz)
language sql
stable
set search_path = ''
as $$
  select distinct on (customer_id) id as appointment_id, customer_id, starts_at
  from public.appointments
  where category_id = p_category_id and status <> 'cancelled'
  order by customer_id, starts_at desc;
$$;
