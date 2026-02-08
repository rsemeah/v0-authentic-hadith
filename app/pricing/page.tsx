"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Check, Heart, Star, Sparkles, X } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { getSubscriptionProducts, getDonationProducts } from "@/lib/products"
import dynamic from "next/dynamic"

const Checkout = dynamic(() => import("@/components/checkout"), { ssr: false })

const subscriptions = getSubscriptionProducts()
const donations = getDonationProducts()

function PricingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "donate" ? "donate" : "premium"
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"premium" | "donate">(initialTab)

  if (selectedProduct) {
    return (
      <div className="min-h-screen marble-bg pb-20 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
            <button
              onClick={() => setSelectedProduct(null)}
              className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            >
              <X className="w-5 h-5 text-[#6b7280]" />
            </button>
            <h1 className="text-lg font-semibold text-[#1a1f36]">Complete Payment</h1>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <Checkout productId={selectedProduct} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1a1f36]">Premium & Support</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center">
            <Star className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a1f36] text-balance">Support Authentic Hadith</h2>
          <p className="text-[#6b7280] mt-2 max-w-md mx-auto text-pretty">
            Go premium for an enhanced experience, or contribute sadaqah to help us preserve and share authentic knowledge.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-[#F8F6F2] border border-[#e5e7eb] p-1 mb-8">
          <button
            onClick={() => setActiveTab("premium")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "premium"
                ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white shadow-sm"
                : "text-[#6b7280] hover:text-[#1a1f36]"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Premium
            </span>
          </button>
          <button
            onClick={() => setActiveTab("donate")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === "donate"
                ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] text-white shadow-sm"
                : "text-[#6b7280] hover:text-[#1a1f36]"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Heart className="w-4 h-4" />
              Sadaqah
            </span>
          </button>
        </div>

        {/* Premium Plans */}
        {activeTab === "premium" && (
          <div className="space-y-4">
            {subscriptions.map((plan) => {
              const priceDisplay =
                plan.interval === "year"
                  ? `$${(plan.priceInCents / 100).toFixed(2)}/yr`
                  : `$${(plan.priceInCents / 100).toFixed(2)}/mo`
              const monthlyEquiv =
                plan.interval === "year" ? `$${(plan.priceInCents / 100 / 12).toFixed(2)}/mo` : null

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-5 transition-all ${
                    plan.highlighted
                      ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
                      : "border border-[#e5e7eb] bg-white"
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white text-xs font-bold">
                      Best Value
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#1a1f36]">{plan.name}</h3>
                      <p className="text-sm text-[#6b7280] mt-0.5">{plan.description}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-2xl font-bold text-[#1a1f36]">{priceDisplay}</div>
                      {monthlyEquiv && <div className="text-xs text-[#C5A059] font-medium">{monthlyEquiv}</div>}
                    </div>
                  </div>

                  {plan.features && (
                    <ul className="space-y-2 mb-5">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-[#4a5568]">
                          <Check className="w-4 h-4 text-[#1B5E43] shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={() => setSelectedProduct(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
                        : "bg-[#F8F6F2] border border-[#e5e7eb] text-[#1a1f36] hover:border-[#C5A059] hover:text-[#C5A059]"
                    }`}
                  >
                    Subscribe Now
                  </button>
                </div>
              )
            })}

            {/* Free tier comparison */}
            <div className="rounded-xl border border-dashed border-[#e5e7eb] p-5 bg-white/50">
              <h3 className="text-sm font-semibold text-[#6b7280] uppercase tracking-wider mb-3">
                Free Tier (Current)
              </h3>
              <ul className="space-y-2">
                {["Browse all 8 hadith collections", "Basic search", "Save & bookmark hadiths", "AI assistant (limited)"].map(
                  (feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-[#6b7280]">
                      <Check className="w-4 h-4 text-[#6b7280] shrink-0" />
                      {feature}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Donation Options */}
        {activeTab === "donate" && (
          <div className="space-y-6">
            <div className="rounded-xl bg-gradient-to-br from-[#1B5E43] to-[#2D7A5B] p-5 text-white">
              <h3 className="font-semibold text-lg mb-2">Sadaqah Jariyah</h3>
              <p className="text-white/80 text-sm leading-relaxed">
                {'"'}The Prophet (peace be upon him) said: {'"'}When a person dies, their deeds come to an end except
                for three: ongoing charity (sadaqah jariyah), beneficial knowledge, or a righteous child who prays for
                them.{'"'} - Sahih Muslim
              </p>
            </div>

            <p className="text-sm text-[#6b7280] text-center">
              Your contribution helps maintain the database, improve translations, and keep the app free for everyone.
            </p>

            <div className="grid grid-cols-3 gap-3">
              {donations.map((donation) => {
                const amount = `$${(donation.priceInCents / 100).toFixed(0)}`
                return (
                  <button
                    key={donation.id}
                    onClick={() => setSelectedProduct(donation.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#e5e7eb] bg-white hover:border-[#1B5E43] hover:shadow-md transition-all"
                  >
                    <Heart className="w-6 h-6 text-[#1B5E43]" />
                    <span className="text-xl font-bold text-[#1a1f36]">{amount}</span>
                    <span className="text-xs text-[#6b7280] text-center">One-time</span>
                  </button>
                )
              })}
            </div>

            <p className="text-xs text-center text-[#6b7280] italic mt-4">
              Sharing knowledge is sadaqah. May Allah reward your generosity.
            </p>
          </div>
        )}
      </main>

      <BottomNavigation />
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
