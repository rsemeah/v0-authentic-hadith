import { REVENUECAT_API_KEY, ENTITLEMENT_ID } from "./config"

interface RCEntitlement {
  expires_date: string | null
  product_identifier: string
  purchase_date: string
}

interface RCSubscriber {
  entitlements: Record<string, RCEntitlement>
  subscriptions: Record<string, unknown>
  non_subscriptions: Record<string, unknown[]>
}

interface RCSubscriberResponse {
  subscriber: RCSubscriber
}

/**
 * Check RevenueCat entitlements server-side using the REST API.
 * Uses the public API key (safe for server-side since it's read-only).
 */
export async function checkRevenueCatEntitlement(appUserId: string): Promise<{
  isPro: boolean
  productIdentifier: string | null
  expiresDate: string | null
}> {
  try {
    const response = await fetch(
      `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
      {
        headers: {
          Authorization: `Bearer ${REVENUECAT_API_KEY}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 60 }, // cache for 60 seconds
      }
    )

    if (!response.ok) {
      return { isPro: false, productIdentifier: null, expiresDate: null }
    }

    const data: RCSubscriberResponse = await response.json()
    const entitlement = data.subscriber.entitlements[ENTITLEMENT_ID]

    if (!entitlement) {
      return { isPro: false, productIdentifier: null, expiresDate: null }
    }

    // Check if not expired
    if (entitlement.expires_date) {
      const expiresAt = new Date(entitlement.expires_date)
      if (expiresAt < new Date()) {
        return { isPro: false, productIdentifier: null, expiresDate: null }
      }
    }

    return {
      isPro: true,
      productIdentifier: entitlement.product_identifier,
      expiresDate: entitlement.expires_date,
    }
  } catch {
    return { isPro: false, productIdentifier: null, expiresDate: null }
  }
}
