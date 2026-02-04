-- Enums for payments
do $$
begin
  if not exists (select 1 from pg_type where typname = 'payment_provider') then
    create type payment_provider as enum ('abacatepay', 'stripe');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'approved', 'failed', 'refunded');
  end if;
end $$;

-- Update payments table to support multi-provider
alter table payments
  add column if not exists provider_payment_id text,
  add column if not exists provider_reference text,
  add column if not exists provider_checkout_url text,
  add column if not exists updated_at timestamptz not null default now();

-- Migrate provider column to enum
alter table payments
  alter column provider type payment_provider
  using provider::text::payment_provider;

-- Migrate status column to new enum
alter table payments
  alter column status drop default;

alter table payments
  alter column status type payment_status
  using case
    when status::text = 'awaiting_payment' then 'pending'::payment_status
    when status::text = 'paid' then 'approved'::payment_status
    when status::text = 'error' then 'failed'::payment_status
    else 'pending'::payment_status
  end;

alter table payments
  alter column status set default 'pending';

alter table payments
  alter column currency set default 'BRL';

-- Trigger to keep updated_at in sync
drop trigger if exists set_payments_updated_at on payments;
create trigger set_payments_updated_at
before update on payments
for each row execute procedure set_updated_at();

-- payment_events table for webhook idempotency
create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider payment_provider not null,
  provider_event_id text not null,
  received_at timestamptz not null default now(),
  raw_payload jsonb not null default '{}'::jsonb,
  unique (provider_event_id)
);

create index if not exists payment_events_provider_idx on payment_events(provider);
create index if not exists payment_events_received_at_idx on payment_events(received_at);

-- RLS
alter table payments enable row level security;
alter table payment_events enable row level security;

-- Policies: payments (read-only for authenticated)
drop policy if exists "payments_select_own" on payments;
create policy "payments_select_own"
on payments
for select
to authenticated
using (user_id = auth.uid());

-- Grants: restrict authenticated
revoke all on table payments from anon, authenticated;
revoke all on table payment_events from anon, authenticated;

grant select on table payments to authenticated;

