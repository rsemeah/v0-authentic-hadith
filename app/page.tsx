import Image from "next/image"
import Link from "next/link"
import { BookOpen, Search, Shield, MessageCircle, Star, Heart } from "lucide-react"

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

      {/* Pricing Preview */}
      <section className="px-6 py-16 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-[#2C2416] mb-4">
          Premium Digital Subscription
        </h2>
        <p className="text-[#6b5d4d] mb-10 max-w-xl mx-auto">
          Access all features with a premium subscription. All content is delivered
          digitally through our web and mobile platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto">
          <div className="premium-card gold-border rounded-xl p-6 text-center">
            <h3 className="font-semibold text-[#2C2416]">Monthly</h3>
            <p className="text-3xl font-bold text-[#2C2416] mt-2">
              $4.99
              <span className="text-sm font-normal text-[#6b5d4d]">/mo</span>
            </p>
          </div>
          <div className="premium-card gold-border rounded-xl p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#C5A059] text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
              Best Value
            </div>
            <h3 className="font-semibold text-[#2C2416]">Yearly</h3>
            <p className="text-3xl font-bold text-[#2C2416] mt-2">
              $39.99
              <span className="text-sm font-normal text-[#6b5d4d]">/yr</span>
            </p>
            <p className="text-xs text-[#1B5E43] font-medium mt-1">Save 33%</p>
          </div>
        </div>
        <Link
          href="/pricing"
          className="inline-block mt-8 px-8 py-3 gold-button rounded-lg text-base"
        >
          View All Plans
        </Link>
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
