"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function startCheckoutSession(productId: string) {
  console.log("[v0] startCheckoutSession called with productId:", productId)

  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  console.log("[v0] Found product:", product.name, "stripeProductId:", product.stripeProductId)

  // Look up the default price from the real Stripe product
  const prices = await stripe.prices.list({
    product: product.stripeProductId,
    active: true,
    limit: 1,
  })

  console.log("[v0] Prices found:", prices.data.length)

  if (!prices.data.length) {
    throw new Error(`No active price found for product "${product.stripeProductId}"`)
  }

  const priceId = prices.data[0].id
  console.log("[v0] Using priceId:", priceId)

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

  // Get the authenticated user's email so Stripe links the session to them
  let customerEmail: string | undefined
  let userId = ""
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    customerEmail = user?.email ?? undefined
    userId = user?.id ?? ""
    console.log("[v0] User email:", customerEmail, "userId:", userId)
  } catch {
    console.log("[v0] No authenticated user, proceeding without customer_email")
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    customer_email: customerEmail,
    metadata: {
      supabase_user_id: userId,
      product_id: product.id,
    },
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: product.mode,
    return_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  })

  console.log("[v0] Checkout session created:", session.id, "has client_secret:", !!session.client_secret)
  return session.client_secret
}
