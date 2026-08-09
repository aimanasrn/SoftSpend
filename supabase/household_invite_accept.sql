-- Secure household invitation acceptance.
-- Run this after schema.sql and household_rls_fix.sql.

create extension if not exists pgcrypto;

alter table public.household_members add column if not exists display_name text;
alter table public.household_members add column if not exists email text;

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
  from auth.users u
  where u.id = current_user_id;

  select * into invite
  from public.household_invites
  where token_hash = encode(digest(invite_token, 'sha256'), 'hex')
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if invite.id is null then
    raise exception 'This invitation is invalid or has expired.';
  end if;

  if lower(coalesce(current_email, '')) <> lower(invite.email) then
    raise exception 'Please sign in with the invited email address.';
  end if;

  insert into public.household_members (household_id, user_id, role, status, display_name, email)
  values (invite.household_id, current_user_id, invite.role, 'active', member_name, current_email)
  on conflict (household_id, user_id) do update
    set role = excluded.role,
        status = 'active',
        display_name = excluded.display_name,
        email = excluded.email;

  update public.household_invites
  set accepted_at = now()
  where id = invite.id;

  return jsonb_build_object('household_id', invite.household_id, 'member_id', current_user_id);
end;
$$;

revoke all on function public.accept_household_invite(text) from public, anon;
grant execute on function public.accept_household_invite(text) to authenticated;

create or replace function public.get_my_household_invites()
returns table (
  id uuid,
  household_id uuid,
  household_name text,
  email text,
  role text,
  expires_at timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select i.id, i.household_id, h.name, i.email, i.role, i.expires_at
  from public.household_invites i
  join public.households h on h.id = i.household_id
  where lower(i.email) = lower((select u.email from auth.users u where u.id = auth.uid()))
    and i.accepted_at is null
    and i.expires_at > now()
  order by i.created_at desc;
$$;

create or replace function public.accept_household_invite_by_id(target_invite_id uuid)
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
  where id = target_invite_id and accepted_at is null and expires_at > now();
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

revoke all on function public.get_my_household_invites() from public, anon;
revoke all on function public.accept_household_invite_by_id(uuid) from public, anon;
grant execute on function public.get_my_household_invites() to authenticated;
grant execute on function public.accept_household_invite_by_id(uuid) to authenticated;
