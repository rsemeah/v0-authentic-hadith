import Image from "next/image"
import Link from "next/link"
import { BookOpen, Search, Shield, MessageCircle, Star, Heart, Crown, Infinity, Check, Share2, Users, Copy } from "lucide-react"
import { PRODUCTS } from "@/lib/products"
import { ShareBanner } from "@/components/share-banner"

export default function LandingPage() {
  return (
    <div className="min-h-screen marble-bg">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 md:w-10 md:h-10 shrink-0">
            <Image
              src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
              alt="Authentic Hadith Logo"
              fill
              className="object-contain rounded-full"
              priority
            />
          </div>
          <span className="text-sm md:text-lg font-bold gold-text tracking-[0.08em] uppercase">
            Authentic Hadith
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/login"
            className="px-3 py-2 text-xs md:text-sm font-medium text-foreground hover:text-secondary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/login"
            className="px-3 md:px-5 py-2 gold-button rounded-lg text-xs md:text-sm whitespace-nowrap"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 md:px-6 pt-10 md:pt-16 pb-12 md:pb-20 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight text-balance">
          Your Journey to{" "}
          <span className="gold-text gold-text-heading">Prophetic Wisdom</span>
        </h1>
        <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty">
          Access verified collections of prophetic traditions from the six major hadith
          compilations, meticulously authenticated and preserved for generations of
          knowledge seekers.
        </p>
        <div className="mt-6 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3 gold-button rounded-lg text-base text-center"
          >
            Start Learning Free
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3 emerald-button rounded-lg text-base text-center"
          >
            View Premium Plans
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 md:px-6 py-10 md:py-16 max-w-5xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-center text-foreground mb-8 md:mb-12">
          Everything You Need to Study Hadith
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
              <h3 className="font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-4 md:px-6 py-10 md:py-16 max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-4">
            Free to explore. Pro for depth.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Browse all 8 collections, read full hadiths, and get 3 AI explanations daily --
            completely free. Upgrade when you want deeper study tools.
          </p>
        </div>

        {/* Explorer highlight */}
        <div className="max-w-3xl mx-auto mb-6 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#1B5E43] dark:text-[#6bb895]" />
              <h3 className="font-semibold text-foreground">Explorer</h3>
              <span className="text-xs font-bold text-[#1B5E43] dark:text-[#6bb895]">FREE</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
            {["All 8 collections", "Full Arabic + English text", "Basic search", "3 AI explanations/day", "40 saved hadiths", "1 quiz/day"].map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="w-3 h-3 text-[#1B5E43] dark:text-[#6bb895] shrink-0" />{f}
              </span>
            ))}
          </div>
        </div>

        {/* Paid plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 max-w-3xl mx-auto">
          {PRODUCTS.map((plan) => {
            const icons: Record<string, typeof Star> = {
              "monthly-premium": Star,
              "annual-premium": Crown,
              "lifetime-access": Infinity,
            }
            const Icon = icons[plan.id] || Star

            return (
              <div
                key={plan.id}
                className={`relative rounded-xl p-5 flex flex-col ${
                  plan.highlighted
                    ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
                    : plan.id === "lifetime-access"
                      ? "border-2 border-[#1B5E43]/40 dark:border-[#4a9973]/40 bg-card"
                      : "premium-card"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold whitespace-nowrap ${
                      plan.highlighted
                        ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D]"
                        : "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C5A059]">{plan.tierLabel}</span>
                </div>

                <div className="mb-3">
                  <span className="text-2xl font-bold text-foreground">
                    ${(plan.priceInCents / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    {plan.interval === "month"
                      ? "/mo"
                      : plan.interval === "year"
                        ? "/yr"
                        : ""}
                  </span>
                  {plan.interval === "year" && (
                    <span className="block text-xs text-[#C5A059] font-medium mt-0.5">
                      ${(plan.priceInCents / 100 / 12).toFixed(2)}/mo billed yearly
                    </span>
                  )}
                </div>

                {plan.features && (
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.slice(0, 3).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-[#1B5E43] dark:text-[#6bb895] shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}

                <Link
                  href={`/pricing?plan=${plan.id}`}
                  className={`block w-full py-2.5 rounded-xl font-semibold text-sm text-center transition-all mt-auto ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
                      : plan.id === "lifetime-access"
                        ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B] text-white hover:opacity-90"
                        : "bg-muted border border-border text-foreground hover:border-secondary hover:text-secondary"
                  }`}
                >
                  {plan.trialDays ? `Start Free Trial` : plan.mode === "payment" ? "Get Founding Access" : "Subscribe"}
                </Link>
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Not ready to commit? <Link href="/login" className="gold-text font-medium hover:underline">Start free as an Explorer</Link> -- browse all collections, basic search, and 3 AI explanations daily.
        </p>
      </section>

      {/* Share CTA */}
      <ShareBanner />

      {/* Footer */}
      <footer className="px-4 md:px-6 py-8 md:py-12 border-t border-border">
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
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">
              Pricing
            </Link>
            <a href="mailto:support@authentichadith.app" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            Made with care for the Muslim community
          </p>
        </div>
      </footer>
    </div>
  )
}
