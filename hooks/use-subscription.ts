"use client"

import { useState, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

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

      const { data } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .in("status", ["active", "trialing", "lifetime"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (data) {
        setSub({
          isPremium: true,
          plan: data.product_id,
          status: data.status,
          currentPeriodEnd: data.current_period_end,
          loading: false,
        })
      } else {
        setSub((prev) => ({ ...prev, loading: false }))
      }
    }

    check()
  }, [])

  return sub
}
