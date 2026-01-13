import { AuthForm } from "@/components/auth-form"
import Image from "next/image"

export default function AuthPage() {
  return (
    <div className="min-h-screen marble-bg flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute inset-0 geometric-shimmer pointer-events-none">
        <svg className="w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="islamicPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M10 0L20 10L10 20L0 10Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.3"
                className="text-[#C5A059]"
              />
              <circle
                cx="10"
                cy="10"
                r="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-[#1B5E43]"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamicPattern)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <div className="mb-6 relative w-40 h-40 sm:w-48 sm:h-48">
          <Image
            src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
            alt="Authentic Hadith Logo"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-[0.15em] gold-text mb-2 text-center font-serif">
          AUTHENTIC HADITH
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground tracking-[0.1em] mb-8 text-center uppercase">
          Learn From Verified Sources
        </p>

        {/* Auth Card */}
        <div className="w-full gold-border rounded-lg p-6 sm:p-8 premium-card">
          <AuthForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6 max-w-sm">
          By continuing, you agree to our{" "}
          <a href="#" className="gold-text hover:opacity-80 transition-opacity">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="gold-text hover:opacity-80 transition-opacity">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
