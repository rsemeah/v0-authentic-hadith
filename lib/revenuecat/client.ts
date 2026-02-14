import { Purchases } from "@revenuecat/purchases-js"
import { REVENUECAT_API_KEY } from "./config"

let purchasesInstance: Purchases | null = null

/**
 * Get or create the RevenueCat Purchases instance for web.
 * Requires an appUserId (your Supabase user ID) to identify the customer.
 */
export function getRevenueCatClient(appUserId: string): Purchases {
  if (!purchasesInstance) {
    purchasesInstance = Purchases.configure(REVENUECAT_API_KEY, appUserId)
  }
  return purchasesInstance
}

/**
 * Reset the RevenueCat client (call on logout).
 */
export function resetRevenueCatClient() {
  purchasesInstance = null
}
