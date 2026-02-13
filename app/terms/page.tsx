import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service — Authentic Hadith",
  description: "Terms governing your use of Authentic Hadith.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/about"
            className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <h1 className="text-lg font-semibold text-foreground">Terms of Service</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 prose prose-sm dark:prose-invert prose-headings:font-serif prose-headings:text-[#1b5e43] dark:prose-headings:text-[#4a9973]">
        <p className="text-sm text-muted-foreground">Effective date: February 13, 2026</p>

        <h2>1. Acceptance</h2>
        <p>
          By using Authentic Hadith (&ldquo;the App&rdquo;), you agree to these Terms of Service.
          If you do not agree, do not use the App.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Authentic Hadith provides curated hadith collections from established scholarly sources,
          structured learning paths, and AI-assisted explanations for educational purposes.
        </p>

        <h2>3. Accounts</h2>
        <ul>
          <li>You are responsible for maintaining the security of your account credentials.</li>
          <li>You must provide accurate information when creating an account.</li>
          <li>You may delete your account at any time from the Settings screen.</li>
        </ul>

        <h2>4. AI Disclaimer</h2>
        <p>
          The AI features in this App provide <strong>educational summaries only</strong>. They do not
          constitute religious rulings (fatwas), medical advice, or legal counsel. For personal
          religious guidance, consult qualified scholars in your community.
        </p>

        <h2>5. Content &amp; Intellectual Property</h2>
        <ul>
          <li>Hadith texts are from publicly available scholarly compilations.</li>
          <li>The App&apos;s design, code, and AI-generated explanations are owned by Red Lantern Studios.</li>
          <li>User-generated content (notes, reflections) remains your property. By using the App, you
            grant us a limited license to store and display this content to you within the App.</li>
        </ul>

        <h2>6. Subscriptions &amp; Payments</h2>
        <ul>
          <li>Some features require a paid subscription (Premium or Lifetime).</li>
          <li>On iOS, subscriptions are billed through Apple In-App Purchase. Payment terms,
            renewal, and cancellation are governed by Apple&apos;s terms.</li>
          <li>On web, payments are processed by Stripe.</li>
          <li>Free tier features are available without payment.</li>
          <li>We reserve the right to modify pricing with reasonable notice.</li>
        </ul>

        <h2>7. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the App for any unlawful purpose.</li>
          <li>Attempt to reverse-engineer, scrape, or extract data from the App.</li>
          <li>Abuse AI features (e.g., prompt injection, automated bulk queries).</li>
          <li>Impersonate others or misrepresent your identity.</li>
        </ul>

        <h2>8. Termination</h2>
        <p>
          We may suspend or terminate your access if you violate these terms. You may stop using
          the App and delete your account at any time.
        </p>

        <h2>9. Limitation of Liability</h2>
        <p>
          The App is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable
          for any damages arising from your use of the App, including reliance on AI-generated content.
        </p>

        <h2>10. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use of the App constitutes
          acceptance of the updated terms.
        </p>

        <h2>11. Contact</h2>
        <p>
          Red Lantern Studios<br />
          <a href="mailto:support@authentichadith.app">support@authentichadith.app</a>
        </p>
      </main>
    </div>
  )
}
