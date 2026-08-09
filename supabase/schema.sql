create extension if not exists "uuid-ossp";
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

do $$ declare t text; begin foreach t in array array['profiles','categories','income','transactions','budgets','bills','savings_goals','recurring_transactions','notifications'] loop execute format('drop policy if exists "Users manage own %1$s" on %1$s', t); execute format('create policy "Users manage own %1$s" on %1$s for all using (auth.uid() = user_id) with check (auth.uid() = user_id)', t); end loop; end $$;

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
alter table bills add column if not exists household_id uuid references households(id) on delete set null;
alter table bills add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table bills add column if not exists created_by uuid references auth.users on delete set null;
alter table savings_goals add column if not exists household_id uuid references households(id) on delete set null;
alter table savings_goals add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table savings_goals add column if not exists created_by uuid references auth.users on delete set null;
alter table recurring_transactions add column if not exists household_id uuid references households(id) on delete set null;
alter table recurring_transactions add column if not exists visibility text not null default 'personal' check (visibility in ('personal','shared'));
alter table recurring_transactions add column if not exists created_by uuid references auth.users on delete set null;

create index if not exists household_members_user_idx on household_members(user_id);
create index if not exists household_members_household_idx on household_members(household_id);
create index if not exists transactions_household_idx on transactions(household_id);
create index if not exists budgets_household_idx on budgets(household_id);
create index if not exists bills_household_idx on bills(household_id);
create index if not exists savings_goals_household_idx on savings_goals(household_id);

alter table households enable row level security;
alter table household_members enable row level security;
alter table household_invites enable row level security;

create policy "Members can view their households" on households for select to authenticated
  using (owner_id = (select auth.uid()) or exists (select 1 from household_members hm where hm.household_id = households.id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
create policy "Users can create households" on households for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy "Owners can update households" on households for update to authenticated
  using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "Owners can delete households" on households for delete to authenticated
  using (owner_id = (select auth.uid()));

-- Avoid self-referencing RLS recursion: a member can see their own row, and owners can see the roster.
create policy "Members can view household membership" on household_members for select to authenticated
  using (user_id = (select auth.uid()) or exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())));
create policy "Owners can add household members" on household_members for insert to authenticated
  with check (exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())));
create policy "Owners can manage household members" on household_members for update to authenticated
  using (exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())))
  with check (exists (select 1 from households h where h.id = household_members.household_id and h.owner_id = (select auth.uid())));

create policy "Owners can manage household invites" on household_invites for all to authenticated
  using (invited_by = (select auth.uid())) with check (invited_by = (select auth.uid()));

-- Shared records are visible to active members. Personal records stay owner-only.
create policy "Household members can view shared transactions" on transactions for select to authenticated
  using (household_id is not null and visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
create policy "Household members can add shared transactions" on transactions for insert to authenticated
  with check (visibility = 'shared' and created_by = (select auth.uid()) and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
create policy "Household members can edit shared transactions" on transactions for update to authenticated
  using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')))
  with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));

create policy "Household members can view shared budgets" on budgets for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = budgets.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
create policy "Household members can manage shared budgets" on budgets for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = budgets.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = budgets.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
create policy "Household members can view shared bills" on bills for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = bills.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
create policy "Household members can manage shared bills" on bills for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = bills.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = bills.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
create policy "Household members can view shared goals" on savings_goals for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = savings_goals.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
create policy "Household members can manage shared goals" on savings_goals for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = savings_goals.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = savings_goals.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
create policy "Household members can view shared recurring transactions" on recurring_transactions for select to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = recurring_transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active'));
create policy "Household members can manage shared recurring transactions" on recurring_transactions for all to authenticated using (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = recurring_transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member'))) with check (visibility = 'shared' and exists (select 1 from household_members hm where hm.household_id = recurring_transactions.household_id and hm.user_id = (select auth.uid()) and hm.status = 'active' and hm.role in ('owner','member')));
