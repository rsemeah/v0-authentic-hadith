"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Loader2 } from "lucide-react"
import { Suspense } from "react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    if (sessionId) {
      // Session exists, payment was completed
      setStatus("success")
    } else {
      setStatus("error")
    }
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
          <h1 className="text-2xl font-bold text-[#1a1f36] mb-4">Something went wrong</h1>
          <p className="text-[#6b7280] mb-6">We could not verify your payment. Please contact support if you were charged.</p>
          <Link href="/pricing" className="px-6 py-3 gold-button rounded-lg text-sm inline-block">
            Back to Plans
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
        <h1 className="text-2xl font-bold text-[#1a1f36] mb-2">Payment Successful</h1>
        <p className="text-[#6b7280] mb-8">
          Thank you for supporting Authentic Hadith. Your premium access is now active.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/home" className="px-6 py-3 gold-button rounded-lg text-sm inline-block">
            Go to Home
          </Link>
          <Link href="/login" className="px-6 py-3 text-sm text-[#6b7280] hover:text-[#1a1f36] transition-colors">
            Sign in to your account
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
