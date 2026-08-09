import { supabase } from './supabaseClient'

export type Household = {
  id: string
  name: string
  owner_id: string
}

export type HouseholdMember = {
  id: string
  household_id: string
  user_id: string
  role: 'owner' | 'member' | 'viewer'
  status: 'active' | 'pending' | 'removed'
  display_name?: string | null
  email?: string | null
  joined_at?: string | null
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function loadCurrentHousehold() {
  const user = await getCurrentUser()
  if (!user) return { user: null, household: null, membership: null }

  const { data: membership, error: membershipError } = await supabase
    .from('household_members')
    .select('household_id,role,status')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('joined_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (membershipError) throw membershipError
  if (membership) {
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('id,name,owner_id')
      .eq('id', membership.household_id)
      .single()
    if (householdError) throw householdError
    return { user, household: household as Household, membership }
  }

  const { data: owned, error: ownedError } = await supabase
    .from('households')
    .select('id,name,owner_id')
    .eq('owner_id', user.id)
    .maybeSingle()
  if (ownedError) throw ownedError
  if (owned)
    return { user, household: owned as Household, membership: { user_id: user.id, role: 'owner', status: 'active' } }
  return { user, household: null, membership: null }
}

export async function createHousehold(name = 'Family household') {
  const user = await getCurrentUser()
  if (!user) throw new Error('Your session has expired. Please log in again.')

  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({ name: name.trim() || 'Family household', owner_id: user.id })
    .select('id,name,owner_id')
    .single()
  if (householdError) throw householdError

  const displayName = String(user.user_metadata?.full_name || user.email?.split('@')[0] || 'You')
  const { error: memberError } = await supabase.from('household_members').insert({
    household_id: household.id,
    user_id: user.id,
    role: 'owner',
    status: 'active',
    display_name: displayName,
    email: user.email,
  })
  if (memberError) throw memberError
  return household as Household
}
