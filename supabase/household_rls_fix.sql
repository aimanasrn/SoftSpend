-- Fix household RLS recursion.
-- Run this after schema.sql if the base schema is recreated.

create schema if not exists app_private;

create or replace function app_private.is_household_owner(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1 from public.households h
    where h.id = target_household_id and h.owner_id = auth.uid()
  );
$$;

create or replace function app_private.is_household_member(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.households h
    left join public.household_members hm
      on hm.household_id = h.id
     and hm.user_id = auth.uid()
     and hm.status = 'active'
    where h.id = target_household_id
      and (h.owner_id = auth.uid() or hm.user_id is not null)
  );
$$;

create or replace function app_private.is_household_editor(target_household_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.households h
    left join public.household_members hm
      on hm.household_id = h.id
     and hm.user_id = auth.uid()
     and hm.status = 'active'
     and hm.role in ('owner', 'member')
    where h.id = target_household_id
      and (h.owner_id = auth.uid() or hm.user_id is not null)
  );
$$;

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;
revoke all on all functions in schema app_private from public;
grant execute on function app_private.is_household_owner(uuid) to authenticated;
grant execute on function app_private.is_household_member(uuid) to authenticated;
grant execute on function app_private.is_household_editor(uuid) to authenticated;

drop policy if exists "Members can view their households" on households;
create policy "Members can view their households" on households for select to authenticated
  using (owner_id = (select auth.uid()) or app_private.is_household_member(id));

drop policy if exists "Members can view household membership" on household_members;
create policy "Members can view household membership" on household_members for select to authenticated
  using (user_id = (select auth.uid()) or app_private.is_household_owner(household_id));

drop policy if exists "Owners can add household members" on household_members;
create policy "Owners can add household members" on household_members for insert to authenticated
  with check (app_private.is_household_owner(household_id));

drop policy if exists "Owners can manage household members" on household_members;
create policy "Owners can manage household members" on household_members for update to authenticated
  using (app_private.is_household_owner(household_id))
  with check (app_private.is_household_owner(household_id));

drop policy if exists "Household members can view shared transactions" on transactions;
create policy "Household members can view shared transactions" on transactions for select to authenticated
  using (household_id is not null and visibility = 'shared' and app_private.is_household_member(household_id));

drop policy if exists "Household members can add shared transactions" on transactions;
create policy "Household members can add shared transactions" on transactions for insert to authenticated
  with check (visibility = 'shared' and created_by = (select auth.uid()) and app_private.is_household_editor(household_id));

drop policy if exists "Household members can edit shared transactions" on transactions;
create policy "Household members can edit shared transactions" on transactions for update to authenticated
  using (visibility = 'shared' and app_private.is_household_editor(household_id))
  with check (visibility = 'shared' and app_private.is_household_editor(household_id));
drop policy if exists "Household members can delete shared transactions" on transactions;
create policy "Household members can delete shared transactions" on transactions for delete to authenticated
  using (visibility = 'shared' and app_private.is_household_editor(household_id));

drop policy if exists "Household members can view shared budgets" on budgets;
create policy "Household members can view shared budgets" on budgets for select to authenticated
  using (visibility = 'shared' and app_private.is_household_member(household_id));

drop policy if exists "Household members can manage shared budgets" on budgets;
create policy "Household members can manage shared budgets" on budgets for all to authenticated
  using (visibility = 'shared' and app_private.is_household_editor(household_id))
  with check (visibility = 'shared' and app_private.is_household_editor(household_id));

drop policy if exists "Household members can view shared bills" on bills;
create policy "Household members can view shared bills" on bills for select to authenticated
  using (visibility = 'shared' and app_private.is_household_member(household_id));

drop policy if exists "Household members can manage shared bills" on bills;
create policy "Household members can manage shared bills" on bills for all to authenticated
  using (visibility = 'shared' and app_private.is_household_editor(household_id))
  with check (visibility = 'shared' and app_private.is_household_editor(household_id));

drop policy if exists "Household members can view shared goals" on savings_goals;
create policy "Household members can view shared goals" on savings_goals for select to authenticated
  using (visibility = 'shared' and app_private.is_household_member(household_id));

drop policy if exists "Household members can manage shared goals" on savings_goals;
create policy "Household members can manage shared goals" on savings_goals for all to authenticated
  using (visibility = 'shared' and app_private.is_household_editor(household_id))
  with check (visibility = 'shared' and app_private.is_household_editor(household_id));

drop policy if exists "Household members can view shared recurring transactions" on recurring_transactions;
create policy "Household members can view shared recurring transactions" on recurring_transactions for select to authenticated
  using (visibility = 'shared' and app_private.is_household_member(household_id));

drop policy if exists "Household members can manage shared recurring transactions" on recurring_transactions;
create policy "Household members can manage shared recurring transactions" on recurring_transactions for all to authenticated
  using (visibility = 'shared' and app_private.is_household_editor(household_id))
  with check (visibility = 'shared' and app_private.is_household_editor(household_id));
