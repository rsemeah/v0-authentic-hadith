"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { RevenueCatPaywall } from "@/components/revenuecat-paywall"

export default function PricingPage() {
  const router = useRouter()

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
        <RevenueCatPaywall
          onPurchaseComplete={() => router.push("/home")}
        />
      </main>
    </div>
  )
}
