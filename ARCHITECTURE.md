# Authentic Hadith -- Architecture Overview

> A cross-platform Islamic hadith study platform serving 31,839+ authenticated hadiths from the eight major collections, with AI-powered search, gamified learning paths, and premium subscriptions.

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Web Application Component Diagram](#2-web-application-component-diagram)
3. [Mobile Application Component Diagram](#3-mobile-application-component-diagram)
4. [Database Schema (Entity Relationship)](#4-database-schema-entity-relationship)
5. [Authentication Flow](#5-authentication-flow)
6. [Subscription Flow](#6-subscription-flow)
7. [AI Chat Flow](#7-ai-chat-flow)
8. [Data Flow: Save Hadith (Mobile)](#8-data-flow-save-hadith-mobile)
9. [Deployment Architecture](#9-deployment-architecture)
10. [Feature Matrix](#10-feature-matrix)

---

## 1. High-Level System Architecture

The platform follows a C4 Context-style architecture with two client applications (web and mobile), a shared backend on Vercel, a Supabase data layer, and integrations with Stripe, RevenueCat, and Groq for payments and AI.

```mermaid
graph TB
    subgraph Clients["Client Applications"]
        WEB["Web Client<br/><i>Next.js 15 (App Router)</i><br/>React 19 + Tailwind CSS"]
        MOBILE["Mobile Client<br/><i>Expo / React Native</i><br/>Expo Router + NativeWind"]
    end

    subgraph Vercel["Vercel Edge Network"]
        API["API Routes (24)<br/><i>Next.js Route Handlers</i><br/>Serverless Functions"]
        SSR["SSR Pages (40)<br/><i>Server Components</i><br/>ISR + Streaming"]
    end

    subgraph Supabase["Supabase (Backend-as-a-Service)"]
        AUTH["Auth<br/><i>OAuth, Email/Password,<br/>Apple Sign-In</i>"]
        DB["PostgreSQL<br/><i>RLS-protected tables,<br/>DB functions</i>"]
        STORAGE["Storage<br/><i>OG images,<br/>user assets</i>"]
        REALTIME["Realtime<br/><i>Live subscriptions</i>"]
    end

    subgraph External["External Services"]
        STRIPE["Stripe<br/><i>Web Payments<br/>Subscriptions + Lifetime</i>"]
        RC["RevenueCat<br/><i>Mobile IAP<br/>StoreKit / Billing</i>"]
        GROQ["Groq<br/><i>LLM Inference<br/>llama-3.3-70b</i>"]
        STORES["App Store<br/>Play Store"]
    end

    WEB -->|HTTPS| SSR
    WEB -->|fetch / SWR| API
    MOBILE -->|REST| API
    MOBILE -->|Native SDK| RC

    API --> AUTH
    API --> DB
    API --> GROQ
    API --> STRIPE
    SSR --> DB
    SSR --> AUTH

    RC -->|Webhook| API
    STRIPE -->|Webhook| API

    MOBILE -.->|Distribute| STORES
    AUTH -->|JWT| DB
    DB --> STORAGE

    style WEB fill:#0f766e,color:#fff,stroke:#0d9488
    style MOBILE fill:#1d4ed8,color:#fff,stroke:#3b82f6
    style API fill:#000,color:#fff,stroke:#333
    style SSR fill:#000,color:#fff,stroke:#333
    style AUTH fill:#3ecf8e,color:#000,stroke:#2da672
    style DB fill:#3ecf8e,color:#000,stroke:#2da672
    style STORAGE fill:#3ecf8e,color:#000,stroke:#2da672
    style REALTIME fill:#3ecf8e,color:#000,stroke:#2da672
    style STRIPE fill:#635bff,color:#fff,stroke:#7a73ff
    style RC fill:#f25c54,color:#fff,stroke:#e0453d
    style GROQ fill:#f97316,color:#fff,stroke:#fb923c
    style STORES fill:#6b7280,color:#fff,stroke:#9ca3af
```

---

## 2. Web Application Component Diagram

The Next.js web application is organized into four layers: pages, components, library modules, and external data sources. Data flows left-to-right from user-facing pages through shared components into the lib layer, which communicates with Supabase and third-party APIs.

```mermaid
graph LR
    subgraph Pages["Pages (40 routes)"]
        P_HOME["/ home"]
        P_HADITH["/ hadith / [collection] / [id]"]
        P_SEARCH["/ search"]
        P_CHAT["/ assistant"]
        P_LEARN["/ learn / [path] / [lesson]"]
        P_DASH["/ dashboard"]
        P_SAVED["/ saved & / my-hadith"]
        P_PRICING["/ pricing & / checkout"]
        P_AUTH["/ login & / onboarding"]
        P_PROFILE["/ profile & / settings"]
        P_ADMIN["/ admin"]
        P_MISC["/ about, / privacy, / terms,<br/>/ collections, / topics,<br/>/ achievements, / stories,<br/>/ reflections, / quiz, ..."]
    end

    subgraph Components["Components (47 files)"]
        C_HADITH["Hadith Display<br/><i>HadithCard, HadithReader,<br/>ShareBanner</i>"]
        C_LEARN["Learning<br/><i>ProgressBanner,<br/>ContinueLearning,<br/>PathCompletion</i>"]
        C_AUTH["Auth<br/><i>AuthForm, Google/Apple<br/>SignIn Buttons</i>"]
        C_LAYOUT["Layout<br/><i>Navbar, Sidebar,<br/>Footer, MobileNav</i>"]
        C_GAMIFY["Gamification<br/><i>Achievements,<br/>Streaks, Badges</i>"]
        C_PREMIUM["Premium<br/><i>PremiumGate,<br/>Checkout</i>"]
        C_UI["UI Primitives<br/><i>shadcn/ui: Button, Card,<br/>Dialog, Input, ...</i>"]
    end

    subgraph Lib["Lib Modules (20 files)"]
        L_SUPA["supabase/<br/><i>client, server, admin,<br/>middleware, config</i>"]
        L_API["api/<br/><i>hadith fetchers,<br/>search, enrich</i>"]
        L_STRIPE["stripe.ts<br/><i>Stripe SDK init</i>"]
        L_PRODUCTS["products.ts<br/><i>Tier definitions,<br/>price mapping</i>"]
        L_QUOTAS["quotas/<br/><i>checkAIQuota,<br/>incrementUsage</i>"]
        L_GAMIFY["gamification/<br/><i>achievement engine,<br/>level calc, tracking</i>"]
        L_LEARN["learningProgress.ts<br/><i>path + lesson helpers</i>"]
        L_UTILS["utils.ts<br/><i>hadith-utils,<br/>CDN mapping, seed</i>"]
        L_SUB["subscription.ts<br/><i>tier check helpers</i>"]
    end

    subgraph External["Data Sources"]
        EXT_SUPA["Supabase<br/>PostgreSQL"]
        EXT_STRIPE["Stripe API"]
        EXT_GROQ["Groq API"]
    end

    Pages --> Components
    Components --> Lib
    Lib --> External

    P_HOME & P_HADITH & P_SEARCH --> C_HADITH
    P_LEARN --> C_LEARN
    P_AUTH --> C_AUTH
    P_DASH & P_SAVED --> C_GAMIFY
    P_PRICING --> C_PREMIUM
    Pages --> C_LAYOUT
    Components --> C_UI

    C_HADITH & C_LEARN --> L_API
    C_AUTH --> L_SUPA
    C_PREMIUM --> L_STRIPE & L_PRODUCTS
    C_GAMIFY --> L_GAMIFY

    L_SUPA --> EXT_SUPA
    L_API --> EXT_SUPA
    L_STRIPE --> EXT_STRIPE
    L_QUOTAS --> EXT_SUPA & EXT_GROQ

    style Pages fill:#1B5E43,color:#fff,stroke:#2d7a5a
    style Components fill:#C5A059,color:#000,stroke:#d4b06a
    style Lib fill:#1e293b,color:#fff,stroke:#334155
    style External fill:#3ecf8e,color:#000,stroke:#2da672
```

---

## 3. Mobile Application Component Diagram

The Expo/React Native mobile app uses a similar layered architecture. It communicates with Supabase directly for data and uses RevenueCat for in-app purchases. Offline-capable caching uses SQLite and SecureStore.

```mermaid
graph LR
    subgraph Screens["Screens (19 planned)"]
        S_HOME["Home / Today"]
        S_BROWSE["Browse Collections"]
        S_HADITH["Hadith Detail"]
        S_SEARCH["Search"]
        S_CHAT["AI Assistant"]
        S_LEARN["Learning Paths"]
        S_LESSON["Lesson Viewer"]
        S_SAVED["My Saved Hadiths"]
        S_FOLDERS["Folders"]
        S_PROFILE["Profile"]
        S_SETTINGS["Settings"]
        S_ACHIEVEMENTS["Achievements"]
        S_PREMIUM["Premium / Paywall"]
        S_AUTH["Auth / Onboarding"]
        S_MISC["Stories, Quiz,<br/>Reflections, Share,<br/>Streak Detail"]
    end

    subgraph Components["Components (27 planned)"]
        C_CARD["HadithCard"]
        C_SAVE["SaveModal"]
        C_PLAYER["AudioPlayer"]
        C_STREAK["StreakWidget"]
        C_DAILY["DailyHadith"]
        C_NAV["TabBar + Header"]
        C_GATE["PremiumGate"]
        C_LEARN_C["LessonProgress"]
    end

    subgraph Hooks["Hooks (7)"]
        H_SUB["useSubscription"]
        H_HADITH["useMyHadith"]
        H_AUTH["useAuth"]
        H_STREAK["useStreak"]
        H_SEARCH["useSearch"]
        H_LEARN["useLearning"]
        H_THEME["useTheme"]
    end

    subgraph Context["Context Providers"]
        CTX_AUTH["AuthProvider<br/><i>Supabase session</i>"]
        CTX_SUB["SubscriptionProvider<br/><i>RevenueCat state</i>"]
        CTX_THEME["ThemeProvider<br/><i>Light / Dark</i>"]
        CTX_QUERY["QueryClientProvider<br/><i>TanStack Query</i>"]
    end

    subgraph Storage["Storage Layer"]
        ST_SUPA["Supabase<br/><i>Remote DB</i>"]
        ST_SQLITE["SQLite<br/><i>Offline cache</i>"]
        ST_SECURE["SecureStore<br/><i>Tokens & keys</i>"]
    end

    subgraph ExtMobile["External SDKs"]
        EXT_RC["RevenueCat<br/><i>IAP</i>"]
        EXT_GROQ_M["Groq<br/><i>via API proxy</i>"]
    end

    Screens --> Components
    Components --> Hooks
    Hooks --> Context
    Context --> Storage
    Storage --> ExtMobile

    S_HOME --> C_DAILY & C_STREAK
    S_HADITH --> C_CARD & C_SAVE
    S_PREMIUM --> C_GATE
    S_LEARN --> C_LEARN_C

    H_SUB --> CTX_SUB
    H_AUTH --> CTX_AUTH
    H_HADITH --> CTX_QUERY

    CTX_AUTH --> ST_SUPA & ST_SECURE
    CTX_SUB --> EXT_RC
    CTX_QUERY --> ST_SUPA & ST_SQLITE

    style Screens fill:#1d4ed8,color:#fff,stroke:#3b82f6
    style Components fill:#C5A059,color:#000,stroke:#d4b06a
    style Hooks fill:#7c3aed,color:#fff,stroke:#8b5cf6
    style Context fill:#059669,color:#fff,stroke:#10b981
    style Storage fill:#1e293b,color:#fff,stroke:#334155
    style ExtMobile fill:#f25c54,color:#fff,stroke:#e0453d
```

---

## 4. Database Schema (Entity Relationship)

The PostgreSQL schema is organized around four domains: hadith content, user data, subscriptions/billing, and learning paths. All user-owned tables are protected by Row Level Security (RLS) policies.

```mermaid
erDiagram
    hadiths {
        uuid id PK
        text arabic_text
        text english_translation
        text collection
        int book_number
        int hadith_number
        text reference
        text grade
        text narrator
        bool is_featured
        timestamptz created_at
    }

    collections {
        uuid id PK
        text name_en
        text name_ar
        text slug UK
        text scholar
        int total_hadiths
        bool is_featured
        jsonb grade_distribution
    }

    collection_hadiths {
        uuid id PK
        uuid collection_id FK
        uuid hadith_id FK
        int book_id FK
        uuid chapter_id FK
        int hadith_number
    }

    chapters {
        uuid id PK
        int book_id FK
        int number
        text name_en
        text name_ar
    }

    topics {
        uuid id PK
        text name_en UK
        text name_ar
    }

    hadith_topics {
        uuid hadith_id FK
        uuid topic_id FK
    }

    profiles {
        uuid id PK
        uuid user_id FK
        text email
        text full_name
        text subscription_tier
        text subscription_status
        text stripe_customer_id UK
        text stripe_subscription_id UK
        timestamptz subscription_started_at
        timestamptz subscription_expires_at
    }

    saved_hadith {
        uuid id PK
        uuid user_id FK
        uuid hadith_id FK
        uuid folder_id FK
        text notes
        timestamptz saved_at
    }

    user_folders {
        uuid id PK
        uuid user_id FK
        text name
        text color
        int sort_order
    }

    user_streaks {
        uuid id PK
        uuid user_id FK
        int current_streak
        int longest_streak
        date last_active_date
        int total_days_active
    }

    user_usage {
        uuid user_id PK
        int ai_queries_today
        int ai_queries_this_month
        int saved_hadith_count
        date last_daily_reset
    }

    tier_quotas {
        text tier PK
        int ai_queries_per_day
        int ai_queries_per_month
        int saved_hadith_limit
        bool can_use_advanced_search
        bool can_use_semantic_search
    }

    stripe_events {
        uuid id PK
        text stripe_event_id UK
        text event_type
        jsonb payload
    }

    learning_paths {
        uuid id PK
        text slug UK
        text title
        text description
        text level
        bool is_premium
        int sort_order
    }

    learning_path_lessons {
        uuid id PK
        uuid path_id FK
        text module_id
        text module_title
        text slug
        text title
        int order_index
        text content_type
        text collection_slug
        int hadith_count
        int estimated_minutes
    }

    user_learning_path_progress {
        uuid id PK
        uuid user_id FK
        uuid path_id FK
        text status
        timestamptz started_at
        timestamptz completed_at
        uuid last_lesson_id FK
    }

    user_lesson_progress {
        uuid id PK
        uuid user_id FK
        uuid path_id FK
        uuid lesson_id FK
        text state
        int progress_percent
        timestamptz completed_at
    }

    learning_events {
        uuid id PK
        uuid user_id FK
        text event_type
        jsonb payload
        timestamptz created_at
    }

    user_lesson_notes {
        uuid id PK
        uuid user_id FK
        uuid lesson_id FK
        uuid path_id FK
        text note_text
    }

    saved_collections {
        uuid id PK
        uuid user_id FK
        uuid collection_id FK
    }

    hadiths ||--o{ collection_hadiths : "appears in"
    collections ||--o{ collection_hadiths : "contains"
    hadiths ||--o{ hadith_topics : "tagged with"
    topics ||--o{ hadith_topics : "classifies"
    chapters }o--|| collections : "belongs to"

    profiles ||--o{ saved_hadith : "bookmarks"
    profiles ||--o{ user_folders : "organizes into"
    profiles ||--o{ user_streaks : "tracks streak"
    profiles ||--o{ user_usage : "tracks quota"
    profiles ||--o{ saved_collections : "follows"

    learning_paths ||--o{ learning_path_lessons : "contains"
    profiles ||--o{ user_learning_path_progress : "enrolls in"
    learning_paths ||--o{ user_learning_path_progress : "progress for"
    learning_path_lessons ||--o{ user_lesson_progress : "tracks"
    profiles ||--o{ user_lesson_progress : "completes"
    profiles ||--o{ learning_events : "generates"
    profiles ||--o{ user_lesson_notes : "writes"

    tier_quotas ||--o{ profiles : "governs"
```

---

## 5. Authentication Flow

Authentication supports two paths: OAuth/email on the web and Apple Sign-In on mobile. Both converge on Supabase Auth, which issues JWTs used for all subsequent API calls.

```mermaid
sequenceDiagram
    autonumber
    box rgb(15,118,110) Web Client
        participant WEB as Browser
    end
    box rgb(29,78,216) Mobile Client
        participant MOB as Expo App
    end
    participant SUPA_AUTH as Supabase Auth
    participant DB as Supabase DB

    Note over WEB,DB: Web Authentication (OAuth + Email/Password)

    WEB->>WEB: User clicks "Sign in with Google"<br/>or enters email + password
    WEB->>SUPA_AUTH: signInWithOAuth({ provider: 'google' })<br/>or signInWithPassword({ email, password })
    SUPA_AUTH->>SUPA_AUTH: Validate credentials /<br/>redirect to OAuth provider
    SUPA_AUTH-->>WEB: Return session + JWT
    WEB->>DB: Fetch profile (with JWT in header)
    DB-->>WEB: Profile data (tier, onboarded status)

    alt New user
        WEB->>WEB: Redirect to /onboarding
        WEB->>DB: Create profile + preferences
    else Returning user
        WEB->>WEB: Redirect to /home
    end

    Note over WEB,DB: Mobile Authentication (Apple Sign-In)

    MOB->>MOB: User taps "Sign in with Apple"
    MOB->>MOB: AppleAuthentication.signInAsync()
    MOB->>SUPA_AUTH: signInWithIdToken({<br/>  provider: 'apple',<br/>  token: identityToken<br/>})
    SUPA_AUTH->>SUPA_AUTH: Verify Apple ID token
    SUPA_AUTH-->>MOB: Return session + JWT
    MOB->>MOB: Store tokens in SecureStore
    MOB->>DB: Fetch / create profile
    DB-->>MOB: Profile data

    Note over WEB,DB: Session Refresh (Both Platforms)

    WEB->>SUPA_AUTH: onAuthStateChange() listener
    SUPA_AUTH-->>WEB: Auto-refresh JWT before expiry
    MOB->>SUPA_AUTH: onAuthStateChange() listener
    SUPA_AUTH-->>MOB: Auto-refresh JWT before expiry
```

---

## 6. Subscription Flow

Subscriptions are handled through Stripe on the web and RevenueCat on mobile. Both flows ultimately write the subscription tier to the `profiles` table in Supabase, ensuring a single source of truth.

```mermaid
sequenceDiagram
    autonumber
    box rgb(15,118,110) Web Flow
        participant W_USER as Web User
        participant W_APP as Next.js App
    end
    participant STRIPE as Stripe
    participant API as API Routes
    participant DB as Supabase DB
    box rgb(29,78,216) Mobile Flow
        participant M_USER as Mobile User
        participant M_APP as Expo App
    end
    participant RC as RevenueCat
    participant STORE as App Store /<br/>Play Store

    Note over W_USER,STORE: Web: Stripe Checkout Flow

    W_USER->>W_APP: Click "Subscribe" on /pricing
    W_APP->>API: POST /api/checkout/create-session<br/>{ productId, skipTrial }
    API->>STRIPE: stripe.checkout.sessions.create({<br/>  customer, line_items, mode,<br/>  metadata: { supabase_user_id }<br/>})
    STRIPE-->>API: { url: checkout_url }
    API-->>W_APP: { url }
    W_APP->>W_USER: Redirect to Stripe Checkout
    W_USER->>STRIPE: Complete payment
    STRIPE->>API: Webhook: checkout.session.completed
    API->>API: Verify signature + idempotency check
    API->>DB: UPDATE profiles SET<br/>subscription_tier = 'premium',<br/>stripe_customer_id = '...',<br/>subscription_status = 'active'
    DB-->>API: OK
    API-->>STRIPE: 200 received

    Note over W_USER,STORE: Web: Ongoing Lifecycle

    STRIPE->>API: Webhook: invoice.payment_succeeded
    API->>DB: Extend subscription_expires_at
    STRIPE->>API: Webhook: customer.subscription.deleted
    API->>DB: SET subscription_tier = 'free',<br/>subscription_status = 'expired'

    Note over W_USER,STORE: Mobile: RevenueCat + StoreKit Flow

    M_USER->>M_APP: Tap "Go Premium" on Paywall
    M_APP->>RC: Purchases.purchasePackage(pkg)
    RC->>STORE: StoreKit / Google Billing
    STORE-->>M_USER: Native payment sheet
    M_USER->>STORE: Confirm purchase
    STORE-->>RC: Transaction receipt
    RC-->>M_APP: CustomerInfo updated
    M_APP->>M_APP: syncSubscriptionToSupabase()
    M_APP->>DB: UPDATE profiles SET<br/>subscription_tier = 'premium',<br/>subscription_status = 'active'
    DB-->>M_APP: OK
    M_APP->>M_USER: Unlock premium features
```

---

## 7. AI Chat Flow

The AI assistant uses Groq (llama-3.3-70b-versatile) with tool-use capabilities. The LLM can call `searchHadiths` to query the database mid-conversation, enabling grounded responses backed by authentic sources.

```mermaid
sequenceDiagram
    autonumber
    participant USER as User
    participant CLIENT as Client App
    participant CHAT_API as /api/chat
    participant QUOTA as Quota Check<br/>(check_user_quota)
    participant GROQ as Groq LLM<br/>(llama-3.3-70b)
    participant DB as Supabase DB

    USER->>CLIENT: "What does Islam say about patience?"
    CLIENT->>CHAT_API: POST /api/chat<br/>{ messages: [...] }

    CHAT_API->>CHAT_API: Verify auth (JWT)
    CHAT_API->>QUOTA: checkAIQuota(user_id)
    QUOTA->>DB: SELECT check_user_quota(user_id)
    DB-->>QUOTA: { allowed: true, daily_remaining: 48, tier: 'premium' }
    QUOTA-->>CHAT_API: Allowed

    CHAT_API->>GROQ: streamText({<br/>  model: 'llama-3.3-70b-versatile',<br/>  system: HADITH_SCHOLAR_PROMPT,<br/>  messages,<br/>  tools: { searchHadiths }<br/>})

    Note over GROQ,DB: Tool-use step (up to 3 rounds)

    GROQ->>CHAT_API: tool_call: searchHadiths({ query: "patience" })
    CHAT_API->>DB: SELECT id, hadith_number, collection,<br/>english_translation, narrator, grade<br/>FROM hadiths<br/>WHERE english_translation ILIKE '%patience%'<br/>LIMIT 5
    DB-->>CHAT_API: [5 hadith results]
    CHAT_API->>GROQ: tool_result: { results: [...] }

    GROQ-->>CHAT_API: Streaming response with<br/>cited hadiths and scholarly context
    CHAT_API-->>CLIENT: SSE data stream
    CLIENT-->>USER: Rendered markdown response

    CHAT_API->>DB: increment_ai_usage(user_id)

    Note over USER,DB: Quota exceeded scenario

    USER->>CLIENT: (next day, free tier)
    CLIENT->>CHAT_API: POST /api/chat
    CHAT_API->>QUOTA: checkAIQuota(user_id)
    QUOTA-->>CHAT_API: { allowed: false, tier: 'free' }
    CHAT_API-->>CLIENT: 429 { error: 'quota_exceeded',<br/>upgrade_url: '/pricing' }
    CLIENT-->>USER: "Upgrade to Premium for AI access"
```

---

## 8. Data Flow: Save Hadith (Mobile)

When a mobile user saves a hadith, the app writes to Supabase, caches locally in SQLite for offline access, invalidates TanStack Query caches, and triggers a gamification event.

```mermaid
sequenceDiagram
    autonumber
    participant USER as User
    participant UI as HadithCard
    participant MODAL as SaveModal
    participant HOOK as useMyHadith
    participant SUPA as Supabase
    participant SQLITE as SQLite Cache
    participant TQ as TanStack Query
    participant GAMIFY as Gamification

    USER->>UI: Tap bookmark icon
    UI->>MODAL: Open SaveModal<br/>(select folder, add notes)
    USER->>MODAL: Select "Favorites" folder<br/>+ optional note

    MODAL->>HOOK: saveHadith({<br/>  hadithId, folderId, notes<br/>})

    HOOK->>SUPA: INSERT INTO saved_hadith<br/>{ user_id, hadith_id,<br/>  folder_id, notes }
    SUPA-->>HOOK: { data: savedRecord }

    HOOK->>SQLITE: INSERT INTO saved_hadith_cache<br/>(for offline access)
    SQLITE-->>HOOK: OK

    HOOK->>TQ: queryClient.invalidateQueries(<br/>['saved-hadiths', 'folder-contents']<br/>)
    TQ-->>UI: Re-render with updated state<br/>(bookmark icon filled)

    HOOK->>GAMIFY: trackActivity({<br/>  type: 'hadith_saved',<br/>  hadithId<br/>})
    GAMIFY->>SUPA: Check achievement thresholds<br/>(e.g., "Save 10 hadiths")

    alt Achievement unlocked
        GAMIFY-->>UI: Show achievement toast
    end

    MODAL->>MODAL: Close modal
    UI-->>USER: Bookmark icon filled +<br/>success feedback
```

---

## 9. Deployment Architecture

The web app deploys to Vercel via GitHub integration with preview deployments on every PR. The mobile app uses EAS Build for native binary compilation and EAS Submit for store distribution.

```mermaid
graph TB
    subgraph Source["Source Control"]
        GH["GitHub Repository<br/><i>v0-authentic-hadith</i>"]
    end

    subgraph WebDeploy["Web Deployment"]
        VERCEL_PR["Vercel Preview<br/><i>Per-PR deployments<br/>*.vercel.app</i>"]
        VERCEL_PROD["Vercel Production<br/><i>authentichadith.com<br/>Edge Network (CDN)</i>"]
    end

    subgraph MobileDeploy["Mobile Deployment"]
        EAS_BUILD["EAS Build<br/><i>Cloud-based native<br/>compilation</i>"]
        EAS_DEV["Development Build<br/><i>Internal distribution<br/>Simulator builds</i>"]
        EAS_PREVIEW["Preview Build<br/><i>Internal distribution<br/>TestFlight / Internal Track</i>"]
        EAS_PROD["Production Build<br/><i>Optimized + signed</i>"]
    end

    subgraph Stores["App Stores"]
        APPLE["Apple App Store<br/><i>iOS distribution</i>"]
        GOOGLE["Google Play Store<br/><i>Android distribution</i>"]
    end

    subgraph Infra["Infrastructure"]
        SUPA_CLOUD["Supabase Cloud<br/><i>Managed PostgreSQL<br/>+ Auth + Storage</i>"]
        STRIPE_DASH["Stripe Dashboard<br/><i>Webhooks configured<br/>to Vercel endpoint</i>"]
        RC_DASH["RevenueCat Dashboard<br/><i>App Store Connect<br/>+ Play Console linked</i>"]
    end

    GH -->|Push to main| VERCEL_PROD
    GH -->|Pull request| VERCEL_PR
    GH -->|eas build| EAS_BUILD

    EAS_BUILD --> EAS_DEV
    EAS_BUILD --> EAS_PREVIEW
    EAS_BUILD --> EAS_PROD

    EAS_PROD -->|eas submit| APPLE
    EAS_PROD -->|eas submit| GOOGLE

    VERCEL_PROD --> SUPA_CLOUD
    VERCEL_PROD --> STRIPE_DASH
    EAS_PROD --> SUPA_CLOUD
    EAS_PROD --> RC_DASH

    STRIPE_DASH -->|Webhooks| VERCEL_PROD
    RC_DASH -->|SDK| EAS_PROD

    style GH fill:#24292e,color:#fff,stroke:#444
    style VERCEL_PROD fill:#000,color:#fff,stroke:#333
    style VERCEL_PR fill:#333,color:#fff,stroke:#555
    style EAS_BUILD fill:#4630eb,color:#fff,stroke:#5a44ff
    style EAS_DEV fill:#6b7280,color:#fff,stroke:#9ca3af
    style EAS_PREVIEW fill:#6b7280,color:#fff,stroke:#9ca3af
    style EAS_PROD fill:#4630eb,color:#fff,stroke:#5a44ff
    style APPLE fill:#000,color:#fff,stroke:#333
    style GOOGLE fill:#34a853,color:#fff,stroke:#46c066
    style SUPA_CLOUD fill:#3ecf8e,color:#000,stroke:#2da672
    style STRIPE_DASH fill:#635bff,color:#fff,stroke:#7a73ff
    style RC_DASH fill:#f25c54,color:#fff,stroke:#e0453d
```

---

## 10. Feature Matrix

The table below maps every major feature to its supporting platform(s) and backend dependencies.

| Feature | Web | Mobile | Backend |
|---|---|---|---|
| **Hadith Browsing** | 40 pages with SSR + ISR | Native scroll views | Supabase (hadiths, collections, chapters) |
| **Full-text Search** | `/search` page with filters | Search screen with debounce | Supabase ILIKE queries |
| **AI Chat Assistant** | `/assistant` with streaming UI | Chat screen (via API proxy) | Groq llama-3.3-70b + tool-use |
| **Daily Hadith** | `/today` page | Home screen widget | `/api/daily-hadith` route |
| **Save / Bookmark** | Save to folders via modal | Save modal + SQLite offline cache | `saved_hadith` + `user_folders` tables |
| **Learning Paths** | `/learn/[path]/[lesson]` (4 paths, 26 lessons) | Learning tab with progress | `learning_paths` + `learning_path_lessons` |
| **Lesson Progress** | Progress bar + completion tracking | State-synced progress | `user_lesson_progress` + `user_learning_path_progress` |
| **Lesson Notes** | In-lesson note-taking | Planned | `user_lesson_notes` table |
| **Gamification / Streaks** | Dashboard streak widget + achievements | Streak widget + badge display | `user_streaks` + `user_stats` tables |
| **Achievements** | `/achievements` page | Achievements screen | `gamification/achievement-engine.ts` |
| **User Profile** | `/profile` + `/settings` | Profile + Settings screens | `profiles` table |
| **OAuth Login** | Google + Email/Password | Apple Sign-In | Supabase Auth |
| **Subscription (Premium)** | Stripe Checkout (monthly, yearly, lifetime) | RevenueCat IAP | `profiles.subscription_tier` |
| **Quota Enforcement** | Server-side per-request check | Server-side per-request check | `user_usage` + `tier_quotas` + DB functions |
| **Hadith Enrichment** | `/api/enrich` + admin review | -- | Groq AI + `hadith_enrichment` |
| **Social Sharing** | OG image generation + share links | Native share sheet | `/api/og/hadith` + `/api/share` |
| **Collections Browser** | `/collections` with detail pages | Collections screen | `collections` + `collection_hadiths` |
| **Sahaba Stories** | `/stories` pages | Stories screen | Content in DB |
| **Reflections** | `/reflections` journal | Planned | Supabase table |
| **Quiz** | `/quiz` interactive | Planned | Content-driven |
| **Onboarding** | `/onboarding` multi-step flow | Onboarding screens | `user_preferences.onboarded` |
| **Account Deletion** | `/settings` with confirmation | Settings screen | `delete_user_account()` DB function + archive |
| **Admin Panel** | `/admin` (role-gated) | -- | Server-only |
| **Offline Access** | Service Worker (PWA planned) | SQLite cache + SecureStore | -- |
| **Dark Mode** | Tailwind `dark:` classes | NativeWind theme | `user_settings` |
| **Internationalization** | Arabic text display (RTL) | Arabic text display (RTL) | `arabic_text` column on hadiths |

---

## Key Technology Choices

| Layer | Technology | Rationale |
|---|---|---|
| Web Framework | Next.js 15 (App Router) | Server Components, streaming SSR, API routes in one framework |
| Mobile Framework | Expo (React Native) | Shared JS ecosystem with web, EAS Build for native compilation |
| Database | Supabase (PostgreSQL) | RLS for multi-tenant security, real-time subscriptions, built-in Auth |
| AI / LLM | Groq (llama-3.3-70b) | Sub-second inference latency, tool-use support, cost-effective |
| Web Payments | Stripe | Industry standard, webhook-driven lifecycle, support for subscriptions + one-time |
| Mobile Payments | RevenueCat | Abstracts StoreKit/Billing, handles receipt validation, syncs across platforms |
| Styling (Web) | Tailwind CSS + shadcn/ui | Utility-first with accessible component primitives |
| Styling (Mobile) | NativeWind | Tailwind syntax for React Native, consistent with web |
| State / Cache | TanStack Query | Declarative caching, background refetch, optimistic updates |
| Deployment (Web) | Vercel | Zero-config Next.js hosting, edge CDN, preview deployments |
| Deployment (Mobile) | EAS Build + Submit | Cloud-native iOS/Android builds, OTA updates via expo-updates |
