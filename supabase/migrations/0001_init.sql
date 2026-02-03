-- Extensions
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'visa_application_status') then
    create type visa_application_status as enum (
      'draft',
      'awaiting_payment',
      'paid',
      'processing',
      'done',
      'error'
    );
  end if;
end $$;

-- Helper to keep updated_at in sync
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Tables
create table if not exists visa_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status visa_application_status not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists visa_application_answers (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references visa_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists visa_application_reports (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references visa_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status visa_application_status not null default 'processing',
  report jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references visa_applications(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'mercado_pago',
  status visa_application_status not null default 'awaiting_payment',
  amount_cents integer not null,
  currency text not null default 'BRL',
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Triggers
drop trigger if exists set_visa_applications_updated_at on visa_applications;
create trigger set_visa_applications_updated_at
before update on visa_applications
for each row execute procedure set_updated_at();

drop trigger if exists set_visa_application_answers_updated_at on visa_application_answers;
create trigger set_visa_application_answers_updated_at
before update on visa_application_answers
for each row execute procedure set_updated_at();

-- Indexes
create index if not exists visa_applications_user_id_idx on visa_applications(user_id);
create index if not exists visa_applications_created_at_idx on visa_applications(created_at);

create index if not exists visa_application_answers_user_id_idx on visa_application_answers(user_id);
create index if not exists visa_application_answers_application_id_idx on visa_application_answers(application_id);
create index if not exists visa_application_answers_created_at_idx on visa_application_answers(created_at);

create index if not exists visa_application_reports_user_id_idx on visa_application_reports(user_id);
create index if not exists visa_application_reports_application_id_idx on visa_application_reports(application_id);
create index if not exists visa_application_reports_created_at_idx on visa_application_reports(created_at);

create index if not exists payments_user_id_idx on payments(user_id);
create index if not exists payments_application_id_idx on payments(application_id);
create index if not exists payments_created_at_idx on payments(created_at);

-- RLS
alter table visa_applications enable row level security;
alter table visa_application_answers enable row level security;
alter table visa_application_reports enable row level security;
alter table payments enable row level security;

-- Policies: visa_applications
drop policy if exists "visa_applications_select_own" on visa_applications;
create policy "visa_applications_select_own"
on visa_applications
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "visa_applications_insert_own" on visa_applications;
create policy "visa_applications_insert_own"
on visa_applications
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "visa_applications_update_own" on visa_applications;
create policy "visa_applications_update_own"
on visa_applications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "visa_applications_delete_own" on visa_applications;
create policy "visa_applications_delete_own"
on visa_applications
for delete
to authenticated
using (user_id = auth.uid());

-- Policies: visa_application_answers
drop policy if exists "visa_application_answers_select_own" on visa_application_answers;
create policy "visa_application_answers_select_own"
on visa_application_answers
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "visa_application_answers_insert_own" on visa_application_answers;
create policy "visa_application_answers_insert_own"
on visa_application_answers
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from visa_applications
    where visa_applications.id = application_id
      and visa_applications.user_id = auth.uid()
  )
);

drop policy if exists "visa_application_answers_update_own" on visa_application_answers;
create policy "visa_application_answers_update_own"
on visa_application_answers
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "visa_application_answers_delete_own" on visa_application_answers;
create policy "visa_application_answers_delete_own"
on visa_application_answers
for delete
to authenticated
using (user_id = auth.uid());

-- Policies: visa_application_reports (read-only for user)
drop policy if exists "visa_application_reports_select_own" on visa_application_reports;
create policy "visa_application_reports_select_own"
on visa_application_reports
for select
to authenticated
using (user_id = auth.uid());

-- Policies: payments (read-only for user)
drop policy if exists "payments_select_own" on payments;
create policy "payments_select_own"
on payments
for select
to authenticated
using (user_id = auth.uid());

-- Grants
revoke all on table visa_applications from anon, authenticated;
revoke all on table visa_application_answers from anon, authenticated;
revoke all on table visa_application_reports from anon, authenticated;
revoke all on table payments from anon, authenticated;

grant select, insert on table visa_applications to authenticated;
grant update (metadata) on table visa_applications to authenticated;
grant delete on table visa_applications to authenticated;

grant select, insert on table visa_application_answers to authenticated;
grant update (answers) on table visa_application_answers to authenticated;
grant delete on table visa_application_answers to authenticated;

grant select on table visa_application_reports to authenticated;
grant select on table payments to authenticated;
