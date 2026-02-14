"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getRevenueCatClient } from "@/lib/revenuecat/client"
import { ENTITLEMENT_ID } from "@/lib/revenuecat/config"

export interface UserSubscription {
  isPremium: boolean
  plan: string | null
  status: string | null
  currentPeriodEnd: string | null
  loading: boolean
}

export function useSubscription(): UserSubscription {
  const [sub, setSub] = useState<UserSubscription>({
    isPremium: false,
    plan: null,
    status: null,
    currentPeriodEnd: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()

    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setSub((prev) => ({ ...prev, loading: false }))
        return
      }

      try {
        const rc = getRevenueCatClient(user.id)
        const customerInfo = await rc.getCustomerInfo()
        const entitlement = customerInfo.entitlements.active[ENTITLEMENT_ID]

        if (entitlement?.isActive) {
          setSub({
            isPremium: true,
            plan: entitlement.productIdentifier,
            status: "active",
            currentPeriodEnd: entitlement.expirationDate,
            loading: false,
          })
          return
        }
      } catch {
        // RevenueCat check failed
      }

      setSub((prev) => ({ ...prev, loading: false }))
    }

    check()
  }, [])

  return sub
}
