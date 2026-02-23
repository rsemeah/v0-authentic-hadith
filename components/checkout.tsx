"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"
import { AlertCircle, RotateCcw } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({ productId }: { productId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const fetchClientSecret = useCallback(async () => {
    try {
      setError(null)
      const secret = await startCheckoutSession(productId)
      return secret
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start checkout"
      setError(message)
      throw err
    }
  }, [productId])

  const handleComplete = useCallback(() => {
    router.push("/checkout/success")
  }, [router])

  const handleRetry = () => {
    setError(null)
    setKey((k) => k + 1)
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Checkout Error</p>
        <p className="text-xs text-muted-foreground mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-background border border-border text-sm font-medium hover:border-[#C5A059] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout" key={key}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret, onComplete: handleComplete }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
