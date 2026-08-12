import Stripe from "https://esm.sh/stripe@18.5.0?target=deno"
import { adminClient } from "../_shared/auth.ts"

const stripeApiVersion = "2026-02-25.clover"

function iso(unixSeconds: number | null | undefined) {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null
}

async function syncSubscription(stripe: Stripe, subscription: Stripe.Subscription, knownUserId?: string) {
  const db = adminClient()
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id
  let userId = knownUserId ?? subscription.metadata?.user_id ?? null

  if (!userId) {
    const { data } = await db.from("subscriptions").select("user_id").eq("stripe_customer_id", customerId).maybeSingle()
    userId = data?.user_id ?? null
  }
  if (!userId) {
    console.warn("Stripe subscription has no matching SoftSpend user", subscription.id)
    return
  }

  const { error } = await db.from("subscriptions").upsert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0]?.price.id ?? null,
    status: subscription.status,
    current_period_start: iso(subscription.current_period_start),
    current_period_end: iso(subscription.current_period_end),
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" })
  if (error) throw error
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 })
  const secretKey = Deno.env.get("STRIPE_SECRET_KEY")
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")
  if (!secretKey || !webhookSecret) return new Response("Webhook is not configured", { status: 503 })

  try {
    const stripe = new Stripe(secretKey, { apiVersion: stripeApiVersion })
    const signature = req.headers.get("Stripe-Signature")
    if (!signature) return new Response("Missing Stripe-Signature", { status: 400 })
    const body = await req.text()
    const cryptoProvider = Stripe.createSubtleCryptoProvider()
    const event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, cryptoProvider)

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await syncSubscription(stripe, subscription, session.metadata?.user_id ?? session.client_reference_id ?? undefined)
      }
    } else if (event.type.startsWith("customer.subscription.")) {
      await syncSubscription(stripe, event.data.object as Stripe.Subscription)
    } else if (event.type === "invoice.paid" || event.type === "invoice.payment_failed") {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id
      if (subscriptionId) await syncSubscription(stripe, await stripe.subscriptions.retrieve(subscriptionId))
    }

    return new Response(JSON.stringify({ received: true }), { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("stripe-webhook", error)
    return new Response(`Webhook Error: ${error instanceof Error ? error.message : "invalid payload"}`, { status: 400 })
  }
})
