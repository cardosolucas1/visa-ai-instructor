-- Store AbacatePay customer id per user
create table if not exists abacatepay_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_customer_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

drop trigger if exists set_abacatepay_customers_updated_at on abacatepay_customers;
create trigger set_abacatepay_customers_updated_at
before update on abacatepay_customers
for each row execute procedure set_updated_at();

create index if not exists abacatepay_customers_user_id_idx on abacatepay_customers(user_id);

alter table abacatepay_customers enable row level security;

drop policy if exists "abacatepay_customers_select_own" on abacatepay_customers;
create policy "abacatepay_customers_select_own"
on abacatepay_customers
for select
to authenticated
using (user_id = auth.uid());

revoke all on table abacatepay_customers from anon, authenticated;
grant select on table abacatepay_customers to authenticated;
