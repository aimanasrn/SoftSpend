create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create table if not exists profiles (id uuid primary key references auth.users on delete cascade, full_name text, avatar_url text, currency text default 'MYR', timezone text default 'Asia/Kuala_Lumpur', default_income numeric default 0, monthly_start_day int default 1, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists categories (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade, name text not null, type text not null check (type in ('income','expense')), icon text, color text, is_default boolean default false, created_at timestamptz default now());
create table if not exists income (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, name text not null, amount numeric not null, income_type text, income_date date not null, is_recurring boolean default false, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists transactions (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, category_id uuid references categories(id), type text not null check (type in ('income','expense')), amount numeric not null, description text, transaction_date date not null, payment_method text, notes text, receipt_url text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists budgets (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, category_id uuid references categories(id), name text not null, month int not null, year int not null, budget_amount numeric not null, target_amount numeric, target_type text, due_date date, notes text, is_recurring boolean default false, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists bills (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, name text not null, category_id uuid references categories(id), amount numeric not null, due_date date not null, status text default 'pending', is_recurring boolean default false, recurrence text, payment_date date, notes text, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists savings_goals (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, name text not null, description text, target_amount numeric not null, current_amount numeric default 0, monthly_contribution numeric default 0, target_date date, status text default 'active', created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists recurring_transactions (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, name text not null, category_id uuid references categories(id), amount numeric not null, type text not null, frequency text not null, next_date date not null, end_date date, active boolean default true, created_at timestamptz default now());
create table if not exists notifications (id uuid primary key default uuid_generate_v4(), user_id uuid references auth.users on delete cascade not null, title text not null, message text not null, type text, read boolean default false, created_at timestamptz default now());

alter table profiles enable row level security;
alter table categories enable row level security;
alter table income enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table bills enable row level security;
alter table savings_goals enable row level security;
alter table recurring_transactions enable row level security;
alter table notifications enable row level security;

drop policy if exists "Users manage own profiles" on profiles;
create policy "Users manage own profiles" on profiles for all to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

do $$ declare t text; begin
  foreach t in array array['categories','income','transactions','budgets','bills','savings_goals','recurring_transactions','notifications'] loop
    execute format('drop policy if exists "Users manage own %1$s" on %1$s', t);
    execute format('create policy "Users manage own %1$s" on %1$s for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
  end loop;
end $$;

-- Shared household workspaces
create table if not exists households (
  id uuid primary key default uuid_generate_v4(),
  name text not null default 'Family household',
  owner_id uuid references auth.users on delete cascade not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists household_members (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references households(id) on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null default 'member' check (role in ('owner','member','viewer')),
  status text not null default 'active' check (status in ('active','pending','removed')),
  display_name text,
  email text,
  joined_at timestamptz default now(),
  unique (household_id, user_id)
);

create table if not exists household_invites (
  id uuid primary key default uuid_generate_v4(),
  household_id uuid references households(id) on delete cascade not null,
  invited_by uuid references auth.users on delete cascade not null,
  email text not null,
  role text not null default 'member' check (role in ('member','viewer')),
  token_hash text not null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz default now()
);

alter table transactions add column if not exists household_id uuid references households(id) on delete set null;
alter table transactions add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table transactions add column if not exists created_by uuid references auth.users on delete set null;
alter table budgets add column if not exists household_id uuid references households(id) on delete set null;
alter table budgets add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table budgets add column if not exists created_by uuid references auth.users on delete set null;
alter table transactions add column if not exists budget_id uuid references budgets(id) on delete set null;
alter table bills add column if not exists household_id uuid references households(id) on delete set null;
alter table bills add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table bills add column if not exists created_by uuid references auth.users on delete set null;
alter table savings_goals add column if not exists household_id uuid references households(id) on delete set null;
alter table savings_goals add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table savings_goals add column if not exists created_by uuid references auth.users on delete set null;
alter table recurring_transactions add column if not exists household_id uuid references households(id) on delete set null;
alter table recurring_transactions add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table recurring_transactions add column if not exists created_by uuid references auth.users on delete set null;
alter table household_members add column if not exists display_name text;
alter table household_members add column if not exists email text;

create index if not exists household_members_user_idx on household_members(user_id);
create index if not exists household_members_household_idx on household_members(household_id);
create index if not exists transactions_household_idx on transactions(household_id);
create index if not exists transactions_budget_idx on transactions(budget_id);
create index if not exists budgets_household_idx on budgets(household_id);
create index if not exists bills_household_idx on bills(household_id);
create index if not exists savings_goals_household_idx on savings_goals(household_id);

alter table households enable row level security;
alter table household_members enable row level security;
alter table household_invites enable row level security;

drop policy if exists "Members can view their households" on households;
create policy "Members can view their households" on households for select to authenticated
  using (owner_id = (select auth.uid()) or exists (select 1 from household_members hm where hm.household_id = households.id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
drop policy if exists "Users can create households" on households;
create policy "Users can create households" on households for insert to authenticated
  with check (owner_id = (select auth.uid()));
drop policy if exists "Owners can update households" on households;
create policy "Owners can update households" on households for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
drop policy if exists "Owners can delete households" on households;
create policy "Owners can delete households" on households for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Avoid self-referencing RLS recursion: a member can see their own row, and owners can see the roster.
drop policy if exists "Members can view household membership" on household_members;
create policy "Members can view household membership" on household_members for select to authenticated
  using (user_id = (select auth.uid()) or exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())));
drop policy if exists "Owners can add household members" on household_members;
create policy "Owners can add household members" on household_members for insert to authenticated
  with check (exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())));
drop policy if exists "Owners can manage household members" on household_members;
create policy "Owners can manage household members" on household_members for update to authenticated
  using (exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())))
  with check (exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())));

drop policy if exists "Owners can manage household invites" on household_invites;
create policy "Owners can manage household invites" on household_invites for all to authenticated
  using (invited_by = (select auth.uid())) with check (invited_by = (select auth.uid()));

-- Shared records are visible to active members. Personal records stay owner-only.
drop policy if exists "Household members can view shared transactions" on transactions;
create policy "Household members can view shared transactions" on transactions for select to authenticated
  using (household_id is not null and visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
drop policy if exists "Household members can add shared transactions" on transactions;
create policy "Household members can add shared transactions" on transactions for insert to authenticated
  with check (visibility = 'shared' and created_by = (select auth.uid()) and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
drop policy if exists "Household members can edit shared transactions" on transactions;
create policy "Household members can edit shared transactions" on transactions for update to authenticated
  using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')))
  with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
drop policy if exists "Household members can delete shared transactions" on transactions;
create policy "Household members can delete shared transactions" on transactions for delete to authenticated
  using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));

drop policy if exists "Household members can view shared budgets" on budgets;
create policy "Household members can view shared budgets" on budgets for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = budgets.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
drop policy if exists "Household members can manage shared budgets" on budgets;
create policy "Household members can manage shared budgets" on budgets for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = budgets.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = budgets.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
drop policy if exists "Household members can view shared bills" on bills;
create policy "Household members can view shared bills" on bills for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = bills.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
drop policy if exists "Household members can manage shared bills" on bills;
create policy "Household members can manage shared bills" on bills for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = bills.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = bills.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
drop policy if exists "Household members can view shared goals" on savings_goals;
create policy "Household members can view shared goals" on savings_goals for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = savings_goals.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
drop policy if exists "Household members can manage shared goals" on savings_goals;
create policy "Household members can manage shared goals" on savings_goals for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = savings_goals.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = savings_goals.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
drop policy if exists "Household members can view shared recurring transactions" on recurring_transactions;
create policy "Household members can view shared recurring transactions" on recurring_transactions for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = recurring_transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
drop policy if exists "Household members can manage shared recurring transactions" on recurring_transactions;
create policy "Household members can manage shared recurring transactions" on recurring_transactions for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = recurring_transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = recurring_transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));

create or replace function public.accept_household_invite(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  invite public.household_invites%rowtype;
  member_name text;
begin
  if current_user_id is null then
    raise exception 'You must be signed in to accept an invitation.';
  end if;
  select u.email, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1))
    into current_email, member_name
  from auth.users u where u.id = current_user_id;
  select * into invite from public.household_invites
  where token_hash = encode(digest(invite_token, 'sha256'), 'hex')
    and accepted_at is null and expires_at > now()
  order by created_at desc limit 1;
  if invite.id is null then raise exception 'This invitation is invalid or has expired.'; end if;
  if lower(coalesce(current_email, '')) <> lower(invite.email) then
    raise exception 'Please sign in with the invited email address.';
  end if;
  insert into public.household_members (household_id, user_id, role, status, display_name, email)
  values (invite.household_id, current_user_id, invite.role, 'active', member_name, current_email)
  on conflict (household_id, user_id) do update
    set role = excluded.role, status = 'active', display_name = excluded.display_name, email = excluded.email;
  update public.household_invites set accepted_at = now() where id = invite.id;
  return jsonb_build_object('household_id', invite.household_id, 'member_id', current_user_id);
end;
$$;
revoke all on function public.accept_household_invite(text) from public, anon;
grant execute on function public.accept_household_invite(text) to authenticated;

create or replace function public.get_my_household_invites()
returns table (id uuid, household_id uuid, household_name text, email text, role text, expires_at timestamptz)
language sql security definer set search_path = pg_catalog, public
as $$
  select i.id, i.household_id, h.name, i.email, i.role, i.expires_at
  from public.household_invites i join public.households h on h.id = i.household_id
  where lower(i.email) = lower((select u.email from auth.users u where u.id = auth.uid()))
    and i.accepted_at is null and i.expires_at > now()
  order by i.created_at desc;
$$;

create or replace function public.accept_household_invite_by_id(target_invite_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public
as $$
declare current_user_id uuid := auth.uid(); current_email text; invite public.household_invites%rowtype; member_name text;
begin
  if current_user_id is null then raise exception 'You must be signed in to accept an invitation.'; end if;
  select u.email, coalesce(u.raw_user_meta_data ->> 'full_name', split_part(u.email, '@', 1)) into current_email, member_name from auth.users u where u.id = current_user_id;
  select * into invite from public.household_invites where id = target_invite_id and accepted_at is null and expires_at > now();
  if invite.id is null then raise exception 'This invitation is invalid or has expired.'; end if;
  if lower(coalesce(current_email, '')) <> lower(invite.email) then raise exception 'Please sign in with the invited email address.'; end if;
  insert into public.household_members (household_id, user_id, role, status, display_name, email) values (invite.household_id, current_user_id, invite.role, 'active', member_name, current_email)
  on conflict (household_id, user_id) do update set role = excluded.role, status = 'active', display_name = excluded.display_name, email = excluded.email;
  update public.household_invites set accepted_at = now() where id = invite.id;
  return jsonb_build_object('household_id', invite.household_id, 'member_id', current_user_id);
end; $$;
revoke all on function public.get_my_household_invites() from public, anon;
revoke all on function public.accept_household_invite_by_id(uuid) from public, anon;
grant execute on function public.get_my_household_invites() to authenticated;
grant execute on function public.accept_household_invite_by_id(uuid) to authenticated;
