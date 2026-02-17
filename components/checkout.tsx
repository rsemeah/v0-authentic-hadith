"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Checkout({ productId }: { productId: string }) {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchClientSecret = useCallback(async () => {
    try {
      const clientSecret = await startCheckoutSession(productId)
      if (!clientSecret) {
        throw new Error("No client secret returned from Stripe")
      }
      return clientSecret
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to start checkout"
      // If user isn't logged in, redirect to login with a return URL
      if (message.includes("logged in")) {
        const returnUrl = encodeURIComponent(`/pricing?plan=${productId}`)
        router.push(`/login?redirect=${returnUrl}`)
        throw err
      }
      setError(message)
      throw err
    }
  }, [productId, router])

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <p className="text-foreground font-medium mb-2">Checkout Error</p>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => { setError(null) }}
          className="px-6 py-2 text-sm font-medium text-[#C5A059] hover:underline"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
