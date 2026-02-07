import { AuthForm } from "@/components/auth-form"
import Image from "next/image"

export default function AuthPage() {
  return (
    <div className="min-h-screen marble-bg flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative border frame */}
      <div className="absolute inset-4 border border-[#C5A059]/20 rounded-lg pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <Image
              src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
              alt="Authentic Hadith Logo"
              fill
              className="object-contain rounded-full shadow-lg"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold gold-text tracking-[0.15em] uppercase">
            Authentic Hadith
          </h1>
          <p className="text-sm text-muted-foreground mt-1 tracking-wide">
            Your journey to prophetic wisdom
          </p>
        </div>

        {/* Auth Card */}
        <div className="premium-card rounded-xl p-6 shadow-xl">
          <AuthForm />
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-6 tracking-wide">
          Verified hadith from trusted scholars
        </p>
      </div>
    </div>
  )
}
