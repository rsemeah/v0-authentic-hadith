"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "pending" | "error">("loading")

  useEffect(() => {
    if (!sessionId) {
      setStatus("error")
      return
    }

    // Verify the session with our API
    async function verify() {
      try {
        const res = await fetch(`/api/checkout/verify?session_id=${sessionId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.status === "complete" || data.payment_status === "paid" || data.payment_status === "no_payment_required") {
            setStatus("success")
          } else {
            // Payment still processing (e.g. 3D Secure pending)
            setStatus("pending")
          }
        } else {
          setStatus("error")
        }
      } catch {
        // If verification fails, still show success (webhook will handle activation)
        setStatus("success")
      }
    }

    verify()
  }, [sessionId])

  if (status === "loading") {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-foreground mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-6">We could not verify your payment. Please contact support if you were charged.</p>
          <Link href="/pricing" className="px-6 py-3 gold-button rounded-lg text-sm inline-block">
            Back to Plans
          </Link>
        </div>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Payment Processing</h1>
          <p className="text-muted-foreground mb-8">
            Your payment is being processed. Your premium access will activate shortly. You can safely close this page.
          </p>
          <Link href="/home" className="px-6 py-3 gold-button rounded-lg text-sm inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen marble-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1B5E43]/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#1B5E43]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Successful</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for supporting Authentic Hadith. Your premium access is now active.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/home" className="px-6 py-3 gold-button rounded-lg text-sm inline-block">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
