const rcKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY
if (!rcKey) {
  console.warn("[RevenueCat] NEXT_PUBLIC_REVENUECAT_API_KEY is not set — payments will not work in production")
}
export const REVENUECAT_API_KEY = rcKey || ""

export const ENTITLEMENT_ID = "RedLantern Studios Pro"

export const RC_PRODUCT_IDS = {
  monthly: "rc_monthly",
  yearly: "rc_yearly",
  lifetime: "rc_lifetime",
} as const
