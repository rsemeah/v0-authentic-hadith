import Image from "next/image"
import Link from "next/link"
import { BookOpen, Search, Shield, MessageCircle, Star, Heart, Zap, Crown, Infinity, Check, Share2, Users, Copy } from "lucide-react"
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
            Choose Your Plan
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start free or unlock the full experience. All premium plans include
            unlimited access to every collection, AI assistant, and learning path.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
          {/* Free Tier */}
          <div className="relative rounded-xl p-6 premium-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-semibold text-foreground">Free</h3>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">$0</span>
              <span className="text-sm text-muted-foreground ml-1">forever</span>
            </div>
            <ul className="space-y-2 mb-5">
              {["Browse all 8 hadith collections", "Basic search", "Save & bookmark hadiths"].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[#1B5E43] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all bg-muted border border-border text-foreground hover:border-secondary hover:text-secondary"
            >
              Get Started
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="relative rounded-xl p-6 gold-border premium-card ring-2 ring-[#C5A059]/30">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-xs font-bold bg-gradient-to-r from-[#C5A059] to-[#E8C77D]">
              Most Popular
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center">
                <Crown className="w-5 h-5 text-[#C5A059]" />
              </div>
              <h3 className="font-semibold text-foreground">Pro</h3>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-foreground">$9.99</span>
              <span className="text-sm text-muted-foreground ml-1">/month</span>
            </div>
            <ul className="space-y-2 mb-5">
              {["Unlimited AI explanations", "Advanced search & semantic search", "Learning paths & progress tracking"].map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-[#1B5E43] shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              href="/pricing"
              className="block w-full py-3 rounded-xl font-semibold text-sm text-center transition-all bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white hover:opacity-90 shadow-md"
            >
              View Plans
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Not ready to commit? <Link href="/login" className="gold-text font-medium hover:underline">Start with our free tier</Link> -- browse all collections and basic search included.
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
