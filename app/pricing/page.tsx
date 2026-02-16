"use client"

import React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Check, Star, Crown, Infinity, X, RotateCcw } from "lucide-react"

import { PRODUCTS } from "@/lib/products"
import type { Product } from "@/lib/products"
import { isNativeApp, showNativePaywall, restoreNativePurchases } from "@/lib/native-bridge"
import dynamic from "next/dynamic"

const Checkout = dynamic(() => import("@/components/checkout"), { ssr: false })

function PriceDisplay({ product }: { product: Product }) {
  if (product.interval === "year") {
    const monthly = (product.priceInCents / 100 / 12).toFixed(2)
    return (
      <div className="text-right shrink-0 ml-4">
        <div className="text-2xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(2)}</div>
        <div className="text-xs text-[#C5A059] font-medium">${monthly}/mo</div>
        <div className="text-xs text-muted-foreground">billed yearly</div>
      </div>
    )
  }
  if (product.interval === "month") {
    return (
      <div className="text-right shrink-0 ml-4">
        <div className="text-2xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">per month</div>
      </div>
    )
  }
  return (
    <div className="text-right shrink-0 ml-4">
      <div className="text-2xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(2)}</div>
      <div className="text-xs text-muted-foreground">one-time</div>
    </div>
  )
}

const planIcons: Record<string, React.ReactNode> = {
  "monthly-premium": <Star className="w-5 h-5 text-[#C5A059]" />,
  "annual-premium": <Crown className="w-5 h-5 text-[#C5A059]" />,
  "lifetime-access": <Infinity className="w-5 h-5 text-[#C5A059]" />,
}

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planFromUrl = searchParams.get("plan")
  const validPlan = PRODUCTS.find((p) => p.id === planFromUrl)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(validPlan ? validPlan.id : null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isNative, setIsNative] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)

  useEffect(() => {
    setIsNative(isNativeApp())
  }, [])

  // In native app, show RevenueCat paywall instead of Stripe
  const handleNativeSubscribe = async () => {
    const success = await showNativePaywall()
    if (success) {
      router.push("/home")
    }
  }

  const handleNativeRestore = async () => {
    setIsRestoring(true)
    const restored = await restoreNativePurchases()
    setIsRestoring(false)
    if (restored) {
      router.push("/home")
    }
  }

  if (selectedProduct) {
    return (
      <div className="min-h-screen marble-bg pb-20 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => {
                setSelectedProduct(null)
                setCheckoutError(null)
              }}
              className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">Complete Payment</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          {checkoutError ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{checkoutError}</p>
              <button
                onClick={() => {
                  setCheckoutError(null)
                  setSelectedProduct(null)
                }}
                className="px-6 py-2 gold-button rounded-lg text-sm"
              >
                Back to Plans
              </button>
            </div>
          ) : (
            <Checkout productId={selectedProduct} />
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Choose Your Plan</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground text-balance">Unlock Authentic Hadith Premium</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto text-pretty">
            Get full access to AI explanations, advanced search, learning paths, and more.
          </p>
        </div>

        <div className="space-y-4">
          {PRODUCTS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl p-5 transition-all ${
                plan.highlighted
                  ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
                  : "border border-border bg-card"
              }`}
            >
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D]"
                      : plan.id === "lifetime-access"
                        ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]"
                        : "bg-[#6b7280]"
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 mt-0.5">
                    {planIcons[plan.id]}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 max-w-xs">{plan.description}</p>
                  </div>
                </div>
                <PriceDisplay product={plan} />
              </div>

              {plan.features && (
                <ul className="space-y-2 mb-5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-[#1B5E43] shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => isNative ? handleNativeSubscribe() : setSelectedProduct(plan.id)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
                    : plan.id === "lifetime-access"
                      ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] text-white hover:opacity-90 shadow-md"
                      : "bg-background border border-border text-foreground hover:border-[#C5A059] hover:text-[#C5A059]"
                }`}
              >
                {plan.mode === "payment" ? "Buy Lifetime Access" : "Subscribe Now"}
              </button>
            </div>
          ))}

          <div className="rounded-xl border border-dashed border-border p-5 bg-card/50">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Free Tier (Current)
            </h3>
            <ul className="space-y-2">
              {[
                "Browse all 8 hadith collections",
                "Basic search",
                "Save & bookmark hadiths",
                "AI assistant (limited)",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Restore Purchases -- required by Apple for IAP apps */}
          {isNative && (
            <button
              onClick={handleNativeRestore}
              disabled={isRestoring}
              className="w-full py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className={`w-4 h-4 ${isRestoring ? "animate-spin" : ""}`} />
              {isRestoring ? "Restoring..." : "Restore Purchases"}
            </button>
          )}
        </div>
      </main>

    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PricingContent />
    </Suspense>
  )
}
