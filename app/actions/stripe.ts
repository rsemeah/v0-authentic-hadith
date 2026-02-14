"use server"

import { stripe } from "@/lib/stripe"
import { getProductById, STRIPE_COUPONS } from "@/lib/products"
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
    .select("stripe_customer_id, email, full_name")
    .eq("user_id", user.id)
    .single()

  let customerId = profile?.stripe_customer_id

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: profile?.full_name || undefined,
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

  // Resolve the price ID: use the configured stripePriceId or fall back to looking up the product
  let priceId = product.stripePriceId
  if (!priceId) {
    const prices = await stripe.prices.list({
      product: product.stripeProductId,
      active: true,
      limit: 1,
    })

    if (!prices.data.length) {
      throw new Error(`No active price found for product "${product.stripeProductId}"`)
    }

    priceId = prices.data[0].id
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  const isSubscription = product.mode === "subscription"
  const isIntro = productId === "monthly-intro"

  const sessionParams: Record<string, unknown> = {
    customer: customerId,
    ui_mode: "embedded",
    line_items: [{ price: priceId, quantity: 1 }],
    mode: product.mode,
    return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      supabase_user_id: user.id,
      product_id: product.id,
    },
  }

  if (isSubscription) {
    const subscriptionData: Record<string, unknown> = {
      metadata: { supabase_user_id: user.id },
    }

    if (isIntro) {
      // Intro offer: apply 50% off first month coupon
      // Cannot use allow_promotion_codes alongside discounts -- Stripe only allows one
      sessionParams.discounts = [{ coupon: STRIPE_COUPONS.INTRO_MONTHLY }]
    } else if (product.trialDays) {
      // Regular plans: offer free trial
      subscriptionData.trial_period_days = product.trialDays
    }

    sessionParams.subscription_data = subscriptionData
  }

  // Only allow promo codes when no discount is already applied (Stripe rejects both together)
  if (!sessionParams.discounts) {
    sessionParams.allow_promotion_codes = true
  }

  const session = await stripe.checkout.sessions.create(
    sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0],
  )

  return session.client_secret
}
