"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { startCheckoutSession } from "@/app/actions/stripe"

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

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
        router.push(`/login?redirect=/pricing?plan=${productId}`)
        throw err
      }
      setError(message)
      throw err
    }
  }, [productId, router])

  if (!stripePromise) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <p className="text-foreground font-medium mb-2">Payment Setup Required</p>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
          Stripe publishable key is not configured. Please check your environment variables.
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <span className="text-red-500 text-xl">!</span>
        </div>
        <p className="text-foreground font-medium mb-2">Checkout Error</p>
        <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">{error}</p>
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
