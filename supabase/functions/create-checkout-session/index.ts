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
    const priceId = Deno.env.get("STRIPE_PRICE_ID")
    const siteUrl = Deno.env.get("SITE_URL")
    if (!secretKey || !priceId || !siteUrl) {
      return json({ error: "Billing is not configured yet. Add STRIPE_SECRET_KEY, STRIPE_PRICE_ID, and SITE_URL to Supabase Function secrets." }, 503)
    }
    const settingsUrl = new URL("/app/settings", siteUrl)
    const successUrl = new URL(settingsUrl)
    successUrl.searchParams.set("billing", "success")
    const cancelledUrl = new URL(settingsUrl)
    cancelledUrl.searchParams.set("billing", "cancelled")

    const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion })
    const db = adminClient()
    const { data: existing } = await db.from("subscriptions").select("stripe_customer_id,status").eq("user_id", user.id).maybeSingle()
    if (existing?.status === "active" || existing?.status === "trialing") {
      return json({ error: "You already have an active Pro subscription. Use Manage subscription instead." }, 409)
    }
    let customerId = existing?.stripe_customer_id ?? null

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        name: user.user_metadata?.full_name ?? undefined,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await db.from("subscriptions").upsert({
        user_id: user.id,
        stripe_customer_id: customerId,
        stripe_price_id: priceId,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      client_reference_id: user.id,
      metadata: { user_id: user.id },
      subscription_data: { metadata: { user_id: user.id } },
      success_url: successUrl.toString(),
      cancel_url: cancelledUrl.toString(),
    })

    return json({ url: session.url })
  } catch (error) {
    console.error("create-checkout-session", error)
    return json({ error: error instanceof Error ? error.message : "Unable to start checkout." }, 400)
  }
})
