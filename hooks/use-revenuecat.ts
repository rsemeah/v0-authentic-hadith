"use client"

import { useState, useEffect, useCallback } from "react"
import { getRevenueCatClient, resetRevenueCatClient } from "@/lib/revenuecat/client"
import { ENTITLEMENT_ID } from "@/lib/revenuecat/config"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { Purchases, CustomerInfo, Package as RCPackage, Offering } from "@revenuecat/purchases-js"

export interface RevenueCatState {
  isPro: boolean
  customerInfo: CustomerInfo | null
  currentOffering: Offering | null
  loading: boolean
  error: string | null
  purchasePackage: (pkg: RCPackage) => Promise<{ success: boolean; error?: string }>
  restorePurchases: () => Promise<void>
  refreshCustomerInfo: () => Promise<void>
}

export function useRevenueCat(): RevenueCatState {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [currentOffering, setCurrentOffering] = useState<Offering | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isPro = customerInfo?.entitlements.active[ENTITLEMENT_ID]?.isActive === true

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setLoading(false)
          return
        }

        const rc = getRevenueCatClient(user.id)

        const info = await rc.getCustomerInfo()
        if (!cancelled) setCustomerInfo(info)

        const offerings = await rc.getOfferings()
        if (!cancelled && offerings.current) {
          setCurrentOffering(offerings.current)
        }
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to initialize RevenueCat")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()

    return () => {
      cancelled = true
    }
  }, [])

  const purchasePackage = useCallback(async (pkg: RCPackage) => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return { success: false, error: "Not authenticated" }

      const rc = getRevenueCatClient(user.id)
      const { customerInfo } = await rc.purchase({ rcPackage: pkg })
      setCustomerInfo(customerInfo)

      if (customerInfo.entitlements.active[ENTITLEMENT_ID]?.isActive) {
        return { success: true }
      }
      return { success: false, error: "Purchase completed but entitlement not active" }
    } catch (err: any) {
      return { success: false, error: err.message || "Purchase failed" }
    }
  }, [])

  const restorePurchases = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const rc = getRevenueCatClient(user.id)
      const info = await rc.getCustomerInfo()
      setCustomerInfo(info)
    } catch (err: any) {
      setError(err.message || "Failed to restore purchases")
    }
  }, [])

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const rc = getRevenueCatClient(user.id)
      const info = await rc.getCustomerInfo()
      setCustomerInfo(info)
    } catch (err: any) {
      console.error("Error refreshing customer info:", err)
    }
  }, [])

  return {
    isPro,
    customerInfo,
    currentOffering,
    loading,
    error,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
  }
}
