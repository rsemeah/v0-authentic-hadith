export interface Product {
  id: string
  stripeProductId: string
  stripePriceId: string
  revenuecatProductId?: string
  name: string
  description: string
  priceInCents: number
  mode: "payment" | "subscription"
  interval?: "month" | "year"
  tier: "free" | "premium" | "lifetime"
  features?: string[]
  highlighted?: boolean
  badge?: string
  trialDays?: number
  skipTrialCoupon?: string
}

export const PRODUCTS: Product[] = [
  {
    id: "monthly-premium",
    stripeProductId: process.env.STRIPE_PRODUCT_MONTHLY || "",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
    revenuecatProductId: "ah_monthly_999",
    name: "Monthly",
    description: "Full access to all collections, AI explanations, learning paths, and progress tracking.",
    priceInCents: 999,
    mode: "subscription",
    interval: "month",
    tier: "premium",
    trialDays: 7,
    features: [
      "Full access to all 8 collections",
      "AI-powered hadith explanations",
      "All learning paths & quizzes",
      "Advanced search & tag filtering",
      "Save, bookmark & organize hadiths",
    ],
  },
  {
    id: "annual-premium",
    stripeProductId: process.env.STRIPE_PRODUCT_ANNUAL || "",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_ANNUAL || "",
    revenuecatProductId: "ah_annual_4999",
    name: "Annual",
    description: "Best value -- full access for one year at a significant discount.",
    priceInCents: 4999,
    mode: "subscription",
    interval: "year",
    tier: "premium",
    highlighted: true,
    badge: "Best Value",
    features: [
      "Everything in Monthly",
      "Save 58% vs monthly",
      "Early access to new features",
      "Extended AI assistant usage",
      "Priority support",
    ],
  },
  {
    id: "lifetime-access",
    stripeProductId: process.env.STRIPE_PRODUCT_LIFETIME || "",
    stripePriceId: process.env.STRIPE_PRICE_LIFETIME || "",
    revenuecatProductId: "ah_lifetime_9999",
    name: "Lifetime",
    description: "One-time payment for permanent access to all current and future features.",
    priceInCents: 9999,
    mode: "payment",
    tier: "lifetime",
    badge: "One-Time",
    features: [
      "Everything in Annual, forever",
      "All future features included",
      "No recurring charges",
      "Lifetime priority support",
      "Founding member recognition",
    ],
  },
]

export function getSubscriptionProducts() {
  return PRODUCTS.filter((p) => p.mode === "subscription")
}

export function getOneTimeProducts() {
  return PRODUCTS.filter((p) => p.mode === "payment")
}

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id)
}

export function getTierFromProductId(productId: string): "free" | "premium" | "lifetime" {
  const product = PRODUCTS.find(
    (p) =>
      p.stripeProductId === productId ||
      p.id === productId ||
      p.revenuecatProductId === productId
  )
  return product?.tier ?? "free"
}
