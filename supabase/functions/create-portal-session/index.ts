import Stripe from "https://esm.sh/stripe@18.5.0?target=deno"
import { adminClient, requireUser } from "../_shared/auth.ts"
import { json, optionsOrNull } from "../_shared/cors.ts"

const stripeApiVersion = "2026-02-25.clover"

Deno.serve(async (req) => {
  const options = optionsOrNull(req)
  if (options) return options
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405)

  try {
    const { user } = await requireUser(req)
    const secretKey = Deno.env.get("STRIPE_SECRET_KEY")
    const siteUrl = Deno.env.get("SITE_URL")
    if (!secretKey || !siteUrl) return json({ error: "Billing is not configured yet. Add STRIPE_SECRET_KEY and SITE_URL to Supabase Function secrets." }, 503)

    const db = adminClient()
    const { data: subscription, error } = await db.from("subscriptions").select("stripe_customer_id").eq("user_id", user.id).maybeSingle()
    if (error) throw error
    if (!subscription?.stripe_customer_id) return json({ error: "No billing profile exists for this account yet." }, 404)

    const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion })
    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${siteUrl.replace(/\/$/, "")}/app/settings`,
    })
    return json({ url: portal.url })
  } catch (error) {
    console.error("create-portal-session", error)
    return json({ error: error instanceof Error ? error.message : "Unable to open billing portal." }, 400)
  }
})
