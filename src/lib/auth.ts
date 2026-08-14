import { supabase } from './supabaseClient'

type SupabaseErrorLike = {
  message?: string
  code?: string
  status?: number
}

export function isSessionError(error: unknown) {
  const candidate = error as SupabaseErrorLike | null
  const message = String(candidate?.message || '').toLowerCase()
  const code = String(candidate?.code || '').toLowerCase()

  return (
    message.includes('jwt') ||
    message.includes('token') ||
    message.includes('session') ||
    code.includes('jwt') ||
    code.includes('token')
  )
}

export function getSessionErrorMessage(error: unknown) {
  const candidate = error as SupabaseErrorLike | null
  const message = String(candidate?.message || '').toLowerCase()

  if (message.includes('issued at future')) {
    return 'Your session clock is out of sync. Please set your device date and time automatically, then sign in again.'
  }
  if (message.includes('expired') || message.includes('invalid jwt') || message.includes('invalid token')) {
    return 'Your session has expired. Please sign in again to continue.'
  }
  return 'Your session is no longer valid. Please sign in again to continue.'
}

export async function recoverSession() {
  const { data, error } = await supabase.auth.refreshSession()
  if (!error && data.session) return data.session

  // Remove only the local session. This does not revoke other devices.
  await supabase.auth.signOut({ scope: 'local' })
  return null
}
