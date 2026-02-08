"use server"

import { stripe } from "@/lib/stripe"
import { PRODUCTS } from "@/lib/products"

export async function startCheckoutSession(productId: string) {
  const product = PRODUCTS.find((p) => p.id === productId)
  if (!product) {
    throw new Error(`Product with id "${productId}" not found`)
  }

  // Look up the default price from the real Stripe product
  const prices = await stripe.prices.list({
    product: product.stripeProductId,
    active: true,
    limit: 1,
  })

  if (!prices.data.length) {
    throw new Error(`No active price found for product "${product.stripeProductId}"`)
  }

  const priceId = prices.data[0].id

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    redirect_on_completion: "never",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: product.mode,
  })

  return session.client_secret
}
