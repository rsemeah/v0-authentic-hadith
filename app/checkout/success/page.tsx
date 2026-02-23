import Link from "next/link"
import { CheckCircle } from "lucide-react"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen marble-bg flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[#1B5E43]/10 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-[#1B5E43]" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2 text-balance">
          Payment Successful
        </h1>
        <p className="text-muted-foreground mb-2 leading-relaxed">
          Thank you for supporting Authentic Hadith.
        </p>
        <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
          Your premium access is now active. It may take a moment for your account to update.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            href="/home"
            className="px-6 py-3 gold-button rounded-lg text-sm inline-block font-medium"
          >
            Go to Home
          </Link>
          <Link
            href="/collections"
            className="px-6 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Browse Collections
          </Link>
        </div>
      </div>
    </div>
  )
}
