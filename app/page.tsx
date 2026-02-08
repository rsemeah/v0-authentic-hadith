import Image from "next/image"
import Link from "next/link"
import { BookOpen, Search, Shield, MessageCircle, Star, Heart, Zap, Crown, Infinity, Check } from "lucide-react"
import { PRODUCTS } from "@/lib/products"

export default function LandingPage() {
  return (
    <div className="min-h-screen marble-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
              alt="Authentic Hadith Logo"
              fill
              className="object-contain rounded-full"
              priority
            />
          </div>
          <span className="text-lg font-bold gold-text tracking-[0.1em] uppercase">
            Authentic Hadith
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium text-[#2C2416] hover:text-[#C5A059] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 gold-button rounded-lg text-sm"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#2C2416] leading-tight text-balance">
          Your Journey to{" "}
          <span className="gold-text">Prophetic Wisdom</span>
        </h1>
        <p className="mt-6 text-lg text-[#6b5d4d] max-w-2xl mx-auto leading-relaxed text-pretty">
          Access verified collections of prophetic traditions from the six major hadith
          compilations, meticulously authenticated and preserved for generations of
          knowledge seekers.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="px-8 py-3 gold-button rounded-lg text-base"
          >
            Start Learning Free
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-3 emerald-button rounded-lg text-base"
          >
            View Premium Plans
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-[#2C2416] mb-12">
          Everything You Need to Study Hadith
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "Six Major Collections",
              description:
                "Browse Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, and Sunan Ibn Majah.",
            },
            {
              icon: Search,
              title: "Advanced Search",
              description:
                "Search across all collections by keyword, narrator, topic, or hadith number with instant results.",
            },
            {
              icon: Shield,
              title: "Authenticity Grading",
              description:
                "Every hadith includes its authentication grade -- Sahih, Hasan, or Da'if -- from trusted scholars.",
            },
            {
              icon: MessageCircle,
              title: "AI-Powered Assistant",
              description:
                "Ask questions about hadith context, meaning, and application with our Islamic knowledge assistant.",
            },
            {
              icon: Star,
              title: "Daily Hadith",
              description:
                "Receive a curated hadith each day to build consistent engagement with prophetic teachings.",
            },
            {
              icon: Heart,
              title: "Save & Bookmark",
              description:
                "Build your personal collection of favorite hadith for quick reference and memorization.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="premium-card rounded-xl p-6"
            >
              <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center mb-4">
                <feature.icon className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-semibold text-[#2C2416] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#6b5d4d] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section - Real Products */}
      <section id="pricing" className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-[#2C2416] mb-4">
            Choose Your Plan
          </h2>
          <p className="text-[#6b5d4d] max-w-xl mx-auto">
            Start free or unlock the full experience. All premium plans include
            unlimited access to every collection, AI assistant, and learning path.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {PRODUCTS.map((plan) => {
            const icons: Record<string, typeof Zap> = {
              "monthly-intro": Zap,
              "monthly-premium": Star,
              "annual-premium": Crown,
              "lifetime-access": Infinity,
            }
            const Icon = icons[plan.id] || Star

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-6 ${
                  plan.highlighted
                    ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
                    : "premium-card"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D]"
                        : plan.id === "lifetime-access"
                          ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]"
                          : "bg-[#6b7280]"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#C5A059]" />
                  </div>
                  <h3 className="font-semibold text-[#2C2416]">{plan.name}</h3>
                </div>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-[#2C2416]">
                    ${(plan.priceInCents / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-[#6b5d4d] ml-1">
                    {plan.interval === "month"
                      ? "/month"
                      : plan.interval === "year"
                        ? "/year"
                        : " one-time"}
                  </span>
                  {plan.interval === "year" && (
                    <span className="block text-xs text-[#C5A059] font-medium mt-1">
                      ${(plan.priceInCents / 100 / 12).toFixed(2)}/mo billed yearly
                    </span>
                  )}
                </div>

                {plan.features && (
                  <ul className="space-y-2 mb-5">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[#6b5d4d]">
                        <Check className="w-4 h-4 text-[#1B5E43] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href="/pricing"
                  className={`block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
                      : plan.id === "lifetime-access"
                        ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] text-white hover:opacity-90"
                        : "bg-[#F8F6F2] border border-[#d4cfc7] text-[#2C2416] hover:border-[#C5A059] hover:text-[#C5A059]"
                  }`}
                >
                  {plan.mode === "payment" ? "Buy Lifetime Access" : "Subscribe Now"}
                </Link>
              </div>
            )
          })}
        </div>

        {/* Free tier note */}
        <p className="text-center text-sm text-[#6b5d4d] mt-8">
          Not ready to commit? <Link href="/login" className="gold-text font-medium hover:underline">Start with our free tier</Link> -- browse all collections and basic search included.
        </p>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-[#d4cfc7]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
                alt="Authentic Hadith Logo"
                fill
                className="object-contain rounded-full"
              />
            </div>
            <span className="text-sm font-semibold gold-text tracking-wider uppercase">
              Authentic Hadith
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#6b5d4d]">
            <Link href="/pricing" className="hover:text-[#2C2416] transition-colors">
              Pricing
            </Link>
            <a href="mailto:support@authentichadith.app" className="hover:text-[#2C2416] transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-[#6b5d4d]">
            Made with care for the Muslim community
          </p>
        </div>
      </footer>
    </div>
  )
}
