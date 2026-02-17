import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getProductById } from "@/lib/products"

export async function POST(request: NextRequest) {
  try {
    const { productId, skipTrial } = await request.json()

    const product = getProductById(productId)
    if (!product) {
      return NextResponse.json({ error: "Invalid product" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id)
    }

    const isSubscription = product.mode === "subscription"

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

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
      mode: product.mode,
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        supabase_user_id: user.id,
        product_id: productId,
      },
    }

    if (isSubscription) {
      const subscriptionData: Record<string, unknown> = {
        metadata: { supabase_user_id: user.id },
      }

      if (!skipTrial && product.trialDays) {
        subscriptionData.trial_period_days = product.trialDays
      }

      sessionParams.subscription_data = subscriptionData
    }

    const session = await stripe.checkout.sessions.create(
      sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0],
    )

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
