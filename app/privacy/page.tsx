import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "Privacy Policy — Authentic Hadith",
  description: "How Authentic Hadith handles your data.",
}

export default function PrivacyPage() {
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
          <h1 className="text-lg font-semibold text-foreground">Privacy Policy</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 prose prose-sm dark:prose-invert prose-headings:font-serif prose-headings:text-[#1b5e43] dark:prose-headings:text-[#4a9973]">
        <p className="text-sm text-muted-foreground">Effective date: February 13, 2026</p>

        <h2>1. Who We Are</h2>
        <p>
          Authentic Hadith (&ldquo;the App&rdquo;) is operated by Red Lantern Studios. This policy explains
          how we collect, use, and protect your information when you use our mobile and web applications.
        </p>

        <h2>2. Data We Collect</h2>
        <h3>Account information</h3>
        <ul>
          <li><strong>Email address</strong> — used for authentication and account recovery.</li>
          <li><strong>Display name</strong> — optional, shown in your profile.</li>
          <li><strong>OAuth identifiers</strong> — if you sign in with Google or Apple, we receive a unique
            identifier and your email from the provider. We do not receive or store your OAuth password.</li>
        </ul>

        <h3>Usage data</h3>
        <ul>
          <li>Saved hadiths, bookmarks, reading progress, and learning progress.</li>
          <li>AI assistant conversation history (linked to your user ID, stored in our database).</li>
          <li>Subscription status (tier, billing period).</li>
        </ul>

        <h3>Device &amp; analytics data</h3>
        <ul>
          <li>We may collect anonymous crash reports and usage analytics via Expo / Sentry.</li>
          <li>We do <strong>not</strong> collect device advertising identifiers (IDFA) unless you opt in via the App Tracking Transparency prompt.</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <ul>
          <li>Provide and personalize the App experience (progress, saved content, streaks).</li>
          <li>Power AI-assisted explanations — your queries are sent to a server-side AI model;
            we do not share raw queries with third parties beyond the AI provider.</li>
          <li>Process subscriptions and payments (via Apple In-App Purchase or Stripe).</li>
          <li>Send transactional emails (password reset, account confirmation).</li>
          <li>Improve the App through aggregated, anonymized analytics.</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do <strong>not</strong> sell your data. We share information only with:</p>
        <ul>
          <li><strong>Supabase</strong> — database and authentication hosting (EU / US data centers).</li>
          <li><strong>AI provider (Groq)</strong> — processes your AI queries server-side. No personal data
            beyond the query text is sent.</li>
          <li><strong>Stripe / Apple</strong> — payment processing; they operate under their own privacy policies.</li>
        </ul>

        <h2>5. Data Retention &amp; Deletion</h2>
        <p>
          Your data is retained as long as your account exists. You may delete your account at any time
          from <strong>Settings &rarr; Privacy &amp; Security &rarr; Delete My Account</strong>.
        </p>
        <p>When you delete your account:</p>
        <ul>
          <li>All personal data (profile, saved hadiths, notes, learning progress, AI history, subscription
            metadata) is archived briefly for integrity purposes, then permanently purged.</li>
          <li>Your authentication credentials are removed from Supabase Auth.</li>
          <li>This action is <strong>irreversible</strong>.</li>
        </ul>

        <h2>6. Security</h2>
        <ul>
          <li>All data in transit is encrypted via HTTPS / TLS.</li>
          <li>Database access is governed by Row Level Security — users can only access their own data.</li>
          <li>Sensitive tokens are stored in Expo SecureStore (iOS Keychain / Android Keystore) on mobile devices.</li>
          <li>Service-role credentials are never exposed to client applications.</li>
        </ul>

        <h2>7. Children&apos;s Privacy</h2>
        <p>
          The App is not directed to children under 13. We do not knowingly collect data from children
          under 13. If we learn we have collected such data, we will delete it promptly.
        </p>

        <h2>8. Your Rights</h2>
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data (see Section 5).</li>
          <li>Object to or restrict processing of your data.</li>
        </ul>
        <p>Contact us at <a href="mailto:support@authentichadith.app">support@authentichadith.app</a> to exercise these rights.</p>

        <h2>9. Changes to This Policy</h2>
        <p>
          We may update this policy from time to time. We will notify you of material changes by
          updating the effective date above and, where appropriate, via in-app notification.
        </p>

        <h2>10. Contact</h2>
        <p>
          Red Lantern Studios<br />
          <a href="mailto:support@authentichadith.app">support@authentichadith.app</a>
        </p>
      </main>
    </div>
  )
}
