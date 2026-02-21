# Authentic Hadith — Web Platform

> A production-ready Next.js web application for studying authentic Islamic hadith from verified sources, built with v0.dev.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/rsemeahs-projects/v0-authentic-hadith)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dz7s9MKfwTE)

---

## Overview

**Authentic Hadith** is a full-featured Islamic education platform providing access to **31,000+ authenticated hadiths** from 8 major collections. This repository is the **web platform** — a Next.js application built iteratively in [v0.dev](https://v0.app/chat/dz7s9MKfwTE) and auto-synced to this repo for Vercel deployment.

### Related Repository

| Repository | Purpose |
|---|---|
| **[v0-authentic-hadith](https://github.com/rsemeah/v0-authentic-hadith)** (this repo) | Next.js web platform — the v0.dev source of truth |
| **[AuthenticHadithApp](https://github.com/rsemeah/AuthenticHadithApp)** | React Native/Expo mobile app + a synced copy of this web app in `external/` |

> The `AuthenticHadithApp` repo contains the native mobile app **and** an `external/v0-authentic-hadith/` directory that mirrors this repo. Both share the same Supabase backend and hadith dataset.

---

## What's Been Built

### Core Content
- **8 major hadith collections** — Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah, Muwatta Malik, Musnad Ahmad
- **Full Arabic + English text** with authentication grades (Sahih / Hasan / Da'if)
- **Narrator chains** and source references for each hadith
- **Daily Hadith** with today's sunnah practice and reflection prompts

### Search & Discovery
- **Advanced search** by keyword, narrator, topic, and hadith number
- **Topic browsing** with category-based navigation
- **Collections browser** with book/chapter drill-down and grade filtering

### AI Assistant
- **Groq Llama 3.3 70B** via Vercel AI SDK with streaming responses
- Personalized system prompt based on user's madhab (school of thought) and learning level
- Hadith search tool integration for contextual answers
- Daily quota management per subscription tier

### Learning & Gamification
- **Knowledge quizzes** — narrator, collection, grade, and completion questions (5-20 per quiz)
- **AI-generated learning paths** — Beginner, Intermediate, Advanced levels
- **Streak tracking** with consecutive daily usage rewards
- **Achievements & badges** for reading milestones, quiz scores, and engagement
- **Progress dashboard** with reading statistics

### Stories & Sunnah
- **Prophet stories** and **Companion stories** with dedicated pages
- **Sunnah practices** — daily lived practices with source references

### User Features
- **Supabase Auth** (email/password) with session management
- **User profiles** — avatar, bio, school of thought, learning level
- **Save & bookmark** hadiths to personal collections
- **Share hadiths** via unique token-based links
- **Dark mode** with full theme support
- **Responsive design** — mobile-first, optimized for all screen sizes
- **Onboarding wizard** for new users

### Monetization
- **Three subscription tiers** — Explorer (free), Premium ($9.99/mo or $49.99/yr), Lifetime ($99.99)
- **Stripe integration** with checkout, webhooks, and subscription lifecycle
- **Quota system** — free tier gets 3 AI queries/day, 40 saved hadiths; premium/lifetime unlocks more

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| **Language** | TypeScript (strict mode) |
| **Database** | Supabase (PostgreSQL with RLS) |
| **Auth** | Supabase Auth |
| **AI** | Groq Llama 3.3 70B, Vercel AI SDK |
| **Payments** | Stripe (subscriptions + one-time) |
| **Charts** | Recharts |
| **State** | TanStack React Query 5, SWR |
| **Forms** | React Hook Form + Zod |
| **Deployment** | Vercel (auto-deploy from this repo) |
| **Build Tool** | v0.app (iterative UI development) |

---

## What's Unique to This Repo

These features exist **only in the web platform** (not in the mobile app):

| Feature | Description |
|---|---|
| **Stories** | Prophet and Companion narrative content |
| **Sunnah Practices** | Daily sunnah with source references |
| **Daily Hadith page** | Dedicated `/today` route with reflection prompts |
| **Stripe billing** | Web-specific payment flow ($9.99/mo, $49.99/yr, $99.99 lifetime) |
| **Gamification XP system** | Points, leaderboards, achievements |
| **Knowledge quizzes** | AI-generated and general quiz modes |
| **Share links** | Token-based hadith sharing with public URLs |
| **v0.dev sync** | Auto-pushes from v0.app editor to this repo |

---

## Project Structure

```
v0-authentic-hadith/
├── app/                           # Next.js App Router (43 pages)
│   ├── page.tsx                   # Landing page
│   ├── home/                      # Authenticated dashboard
│   ├── collections/               # Browse 8 hadith collections
│   ├── hadith/[id]/               # Individual hadith detail
│   ├── search/                    # Advanced search
│   ├── today/                     # Daily hadith + sunnah
│   ├── stories/                   # Prophet & companion stories
│   ├── sunnah/                    # Sunnah practices
│   ├── topics/                    # Topic categories
│   ├── quiz/                      # Knowledge quizzes
│   ├── learn/                     # Learning paths
│   ├── progress/                  # User progress dashboard
│   ├── achievements/              # Badges & rewards
│   ├── saved/                     # User bookmarks
│   ├── my-hadith/                 # Personal collection
│   ├── reflections/               # User notes on hadiths
│   ├── assistant/                 # AI chatbot
│   ├── share/[token]/             # Public share pages
│   ├── profile/                   # User profile
│   ├── settings/                  # Preferences
│   ├── pricing/                   # Subscription tiers
│   ├── checkout/                  # Stripe checkout
│   ├── auth/                      # Login / signup
│   ├── onboarding/                # New user setup
│   ├── about/ contact/ privacy/ terms/
│   └── api/                       # API routes
│       ├── chat/                  # AI assistant endpoint
│       ├── daily-hadith/          # Daily hadith API
│       ├── checkout/              # Stripe session creation
│       ├── subscription/          # Webhook handler
│       ├── quiz/generate/         # AI quiz generation
│       ├── user/quota/            # Usage quota check
│       ├── gamification/          # Achievements & tracking
│       ├── my-hadith/             # Bookmark API
│       ├── enrich/                # Content enrichment
│       └── seed*/                 # Database seeding
├── components/                    # React components
│   ├── layout/                    # AppShell, sidebar, nav
│   ├── collections/               # Collection cards & filters
│   ├── hadith/                    # Hadith display components
│   ├── gamification/              # Achievements, streaks
│   ├── learn/                     # Learning path cards
│   ├── home/                      # Dashboard sections
│   ├── onboarding/                # Setup wizard
│   ├── auth/                      # Auth forms
│   └── ui/                        # shadcn primitives
├── lib/                           # Utilities
│   ├── supabase/                  # Client + server Supabase
│   ├── products.ts                # Subscription tier config
│   └── utils.ts                   # Helpers
├── hooks/                         # Custom React hooks
├── types/                         # TypeScript definitions
├── supabase/migrations/           # Database schema
├── public/                        # Static assets
└── styles/                        # Global CSS
```

---

## Database

Supabase PostgreSQL with Row Level Security. Key tables:

- **`hadiths`** — Arabic text, English translation, grade, narrator, collection reference
- **`collections`** / **`books`** / **`chapters`** — Hierarchical hadith organization
- **`topics`** / **`hadith_topics`** — Thematic categorization
- **`profiles`** — User data, subscription tier, Stripe IDs
- **`saved_hadiths`** / **`saved_collections`** — User bookmarks
- **`quiz_attempts`** — Quiz history and scores
- **`learning_paths`** — Structured curricula
- **`user_streaks`** — Consecutive usage tracking
- **`sunnah_practices`** — Daily practice content
- **`ai_usage`** / **`user_usage`** / **`tier_quotas`** — Quota management
- **`stripe_events`** — Webhook idempotency

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# AI
GROQ_API_KEY=

# Stripe
STRIPE_SECRET_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development server
pnpm dev

# Seed hadith data (optional)
# Visit http://localhost:3000/api/seed?collection=sahih-bukhari

# Build for production
pnpm build
```

---

## How It Works with v0.dev

1. UI and features are built iteratively in [v0.app](https://v0.app/chat/dz7s9MKfwTE)
2. Deploys from v0 are auto-pushed to this repository
3. Vercel picks up the push and deploys to production
4. The `AuthenticHadithApp` repo mirrors this code in `external/v0-authentic-hadith/` for the mobile app to reference shared logic

---

## Acknowledgments

- **Hadith Data** — [fawazahmed0/hadith-api](https://github.com/fawazahmed0/hadith-api)
- **UI Components** — [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://www.radix-ui.com)
- **AI Provider** — [Groq](https://groq.com)
- **Icons** — [Lucide](https://lucide.dev)
