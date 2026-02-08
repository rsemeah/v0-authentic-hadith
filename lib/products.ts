export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  mode: "payment" | "subscription"
  interval?: "month" | "year"
  features?: string[]
  highlighted?: boolean
}

export const PRODUCTS: Product[] = [
  {
    id: "monthly-premium",
    name: "Premium Monthly",
    description: "Full access to all premium features, billed monthly",
    priceInCents: 499,
    mode: "subscription",
    interval: "month",
    features: [
      "Ad-free experience",
      "Advanced hadith search",
      "Offline access to saved hadiths",
      "Priority AI assistant",
      "Custom reading lists",
    ],
  },
  {
    id: "yearly-premium",
    name: "Premium Yearly",
    description: "Full access to all premium features, billed yearly (save 33%)",
    priceInCents: 3999,
    mode: "subscription",
    interval: "year",
    highlighted: true,
    features: [
      "Everything in Monthly",
      "Save 33% vs monthly",
      "Early access to new features",
      "Extended AI assistant usage",
      "Priority support",
    ],
  },
  {
    id: "donation-small",
    name: "Sadaqah - $5",
    description: "Support the preservation and accessibility of authentic hadith",
    priceInCents: 500,
    mode: "payment",
  },
  {
    id: "donation-medium",
    name: "Sadaqah - $10",
    description: "Help us expand our hadith database and improve translations",
    priceInCents: 1000,
    mode: "payment",
  },
  {
    id: "donation-large",
    name: "Sadaqah - $25",
    description: "Generously support ongoing development and scholarship",
    priceInCents: 2500,
    mode: "payment",
  },
]

export function getSubscriptionProducts() {
  return PRODUCTS.filter((p) => p.mode === "subscription")
}

export function getDonationProducts() {
  return PRODUCTS.filter((p) => p.mode === "payment")
}
