export interface Product {
  id: string
  stripeProductId: string
  stripePriceId: string
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
    id: "monthly-intro",
    stripeProductId: process.env.STRIPE_PRODUCT_MONTHLY_INTRO || "prod_TwQlGuMaHFrj8Y",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
    name: "Monthly (Intro)",
    description: "Introductory monthly access for first-time members. Full access to all learning paths and AI explanations.",
    priceInCents: 499,
    mode: "subscription",
    interval: "month",
    tier: "premium",
    badge: "Intro Offer",
    skipTrialCoupon: "INTRO_MONTHLY",
    features: [
      "Full access to all collections",
      "AI-powered explanations",
      "All learning paths",
      "Save & bookmark hadiths",
      "Basic offline access",
    ],
  },
  {
    id: "monthly-premium",
    stripeProductId: process.env.STRIPE_PRODUCT_MONTHLY || "prod_TwQlhKMbgmTCKR",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "",
    name: "Monthly Premium",
    description: "Unlimited access to authentic hadith collections, AI-powered explanations, learning paths, and progress tracking.",
    priceInCents: 999,
    mode: "subscription",
    interval: "month",
    tier: "premium",
    trialDays: 7,
    features: [
      "Everything in Intro",
      "Advanced hadith search",
      "Priority AI assistant",
      "Progress tracking",
      "Custom reading lists",
    ],
  },
  {
    id: "annual-premium",
    stripeProductId: process.env.STRIPE_PRODUCT_ANNUAL || "prod_TwQlg8sbgNPQAY",
    stripePriceId: process.env.STRIPE_PRICE_PREMIUM_ANNUAL_DISCOUNTED || "",
    name: "Annual Premium",
    description: "Full access to Authentic Hadith for one year. Best value for committed learners.",
    priceInCents: 4999,
    mode: "subscription",
    interval: "year",
    tier: "premium",
    highlighted: true,
    badge: "Best Value",
    features: [
      "Everything in Monthly Premium",
      "Save 58% vs monthly",
      "Early access to new features",
      "Extended AI assistant usage",
      "Priority support",
    ],
  },
  {
    id: "lifetime-access",
    stripeProductId: process.env.STRIPE_PRODUCT_LIFETIME || "prod_TwQlP4juGDT1KA",
    stripePriceId: process.env.STRIPE_PRICE_LIFETIME || "",
    name: "Lifetime Access",
    description: "Lifetime access to Authentic Hadith, including all current and future core features.",
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

export const STRIPE_COUPONS = {
  INTRO_MONTHLY: "INTRO_MONTHLY",
} as const

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
  const product = PRODUCTS.find((p) => p.stripeProductId === productId || p.id === productId)
  return product?.tier ?? "free"
}
