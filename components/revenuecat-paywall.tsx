"use client"

import { useState } from "react"
import { Check, Crown, Star, Zap, Infinity, Loader2 } from "lucide-react"
import { useRevenueCat } from "@/hooks/use-revenuecat"
import type { Package as RCPackage } from "@revenuecat/purchases-js"

const packageIcons: Record<string, React.ReactNode> = {
  "$rc_monthly": <Zap className="w-5 h-5 text-[#C5A059]" />,
  "$rc_annual": <Crown className="w-5 h-5 text-[#C5A059]" />,
  "$rc_lifetime": <Infinity className="w-5 h-5 text-[#C5A059]" />,
}

function PackageCard({
  pkg,
  highlighted,
  onPurchase,
  purchasing,
}: {
  pkg: RCPackage
  highlighted?: boolean
  onPurchase: (pkg: RCPackage) => void
  purchasing: boolean
}) {
  const product = pkg.rcBillingProduct
  const price = product.currentPrice?.formattedPrice ?? product.currentPrice?.amountMicros
    ? `$${((product.currentPrice?.amountMicros ?? 0) / 1_000_000).toFixed(2)}`
    : "N/A"

  return (
    <div
      className={`relative rounded-xl p-5 transition-all ${
        highlighted
          ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
          : "border border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
            {packageIcons[pkg.identifier] ?? <Star className="w-5 h-5 text-[#C5A059]" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{product.title}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 max-w-xs">
              {product.description}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 ml-4">
          <div className="text-2xl font-bold text-foreground">{price}</div>
        </div>
      </div>

      <button
        onClick={() => onPurchase(pkg)}
        disabled={purchasing}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${
          highlighted
            ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
            : "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] text-white hover:opacity-90 shadow-md"
        }`}
      >
        {purchasing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </span>
        ) : (
          "Subscribe Now"
        )}
      </button>
    </div>
  )
}

interface RevenueCatPaywallProps {
  onPurchaseComplete?: () => void
  onDismiss?: () => void
}

export function RevenueCatPaywall({ onPurchaseComplete, onDismiss }: RevenueCatPaywallProps) {
  const { currentOffering, loading, error, purchasePackage, isPro } = useRevenueCat()
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  if (isPro) {
    return (
      <div className="text-center py-12">
        <Crown className="w-12 h-12 text-[#C5A059] mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">You&apos;re already a Pro member!</h2>
        <p className="text-muted-foreground">You have full access to all premium features.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    )
  }

  if (error || !currentOffering) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {error || "No offerings available. Please try again later."}
        </p>
      </div>
    )
  }

  const packages = currentOffering.availablePackages

  const handlePurchase = async (pkg: RCPackage) => {
    setPurchasing(true)
    setPurchaseError(null)
    const result = await purchasePackage(pkg)
    setPurchasing(false)

    if (result.success) {
      onPurchaseComplete?.()
    } else if (result.error !== "cancelled") {
      setPurchaseError(result.error ?? "Purchase failed")
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center">
          <Star className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-foreground text-balance">
          Unlock Authentic Hadith Pro
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto text-pretty">
          Get full access to AI explanations, advanced search, learning paths, and more.
        </p>
      </div>

      {purchaseError && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm text-center">
          {purchaseError}
        </div>
      )}

      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <PackageCard
            key={pkg.identifier}
            pkg={pkg}
            highlighted={index === Math.floor(packages.length / 2)}
            onPurchase={handlePurchase}
            purchasing={purchasing}
          />
        ))}
      </div>
    </div>
  )
}
