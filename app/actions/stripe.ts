"use server"

import { stripe } from "@/lib/stripe"
import { getProductById } from "@/lib/products"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string) {
  const product = getProductById(productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Get the authenticated user
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("You must be logged in to subscribe")
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, name")
    .eq("user_id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.name || undefined,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    customerId = customer.id

    await supabase
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("user_id", user.id)
  }

  const isSubscription = product.mode === "subscription"

  // Build price_data inline so we don't depend on pre-created Stripe prices
  const priceData: Record<string, unknown> = {
    currency: "usd",
    product_data: {
      name: product.name,
      description: product.description,
    },
    unit_amount: product.priceInCents,
  }

  if (isSubscription && product.interval) {
    priceData.recurring = { interval: product.interval }
  }

  const sessionParams: Record<string, unknown> = {
    customer: customerId,
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [{ price_data: priceData, quantity: 1 }],
    mode: product.mode,
    metadata: {
      supabase_user_id: user.id,
      product_id: product.id,
    },
  }

  if (isSubscription) {
    const subscriptionData: Record<string, unknown> = {
      metadata: { supabase_user_id: user.id },
    }

    if (product.trialDays) {
      subscriptionData.trial_period_days = product.trialDays
    }

    sessionParams.subscription_data = subscriptionData
  }

  console.log("[v0] Creating Stripe checkout session with params:", JSON.stringify({
    ui_mode: sessionParams.ui_mode,
    redirect_on_completion: sessionParams.redirect_on_completion,
    mode: sessionParams.mode,
    has_return_url: "return_url" in sessionParams,
  }))

  const session = await stripe.checkout.sessions.create(
    sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0],
  )

  console.log("[v0] Stripe session created successfully:", session.id, "client_secret exists:", !!session.client_secret)

  if (!session.client_secret) {
    throw new Error("Failed to create checkout session -- no client secret returned")
  }

  return session.client_secret
}
