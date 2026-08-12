import { createClient, type User } from "jsr:@supabase/supabase-js@2"

export async function requireUser(req: Request): Promise<{ user: User; authorization: string }> {
  const authorization = req.headers.get("Authorization")
  if (!authorization?.startsWith("Bearer ")) throw new Error("You must be signed in.")

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")
  if (!supabaseUrl || !supabaseKey) throw new Error("Supabase function environment is incomplete.")

  const client = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: authorization } },
  })
  const { data, error } = await client.auth.getUser()
  if (error || !data.user) throw new Error("Your session is invalid or has expired.")
  return { user: data.user, authorization }
}

export function adminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service-role environment is incomplete.")
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
}
