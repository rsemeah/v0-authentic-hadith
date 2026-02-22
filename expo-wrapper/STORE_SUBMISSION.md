# App Store Submission Guide

This is the WebView wrapper for Authentic Hadith. It wraps the deployed Next.js
web app (`v0-authentic-hadith.vercel.app`) in a native shell with RevenueCat
in-app purchases.

## Prerequisites

Before submitting, complete every item in this checklist.

### 1. Expo / EAS Setup

- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Login: `eas login`
- [ ] Initialize project: `eas init` (this sets the `extra.eas.projectId` in app.json)
- [ ] Install dependencies: `npm install`

### 2. RevenueCat Configuration

- [ ] Create a project at [RevenueCat Dashboard](https://app.revenuecat.com)
- [ ] Set up Apple App Store app with your shared secret
- [ ] Set up Google Play app with service account credentials
- [ ] Create an entitlement named `RedLantern Studios Pro`
- [ ] Create offerings with your subscription packages (Pro Monthly, Pro Yearly, Founding Lifetime)
- [ ] Copy your **production** API keys (not test keys!) into `app.json` → `extra.revenueCatApiKeyApple` and `extra.revenueCatApiKeyGoogle`
- [ ] Configure the RevenueCat webhook to point to `https://v0-authentic-hadith.vercel.app/api/webhooks/revenuecat`

### 3. Apple App Store Connect

- [ ] Create a new app in [App Store Connect](https://appstoreconnect.apple.com)
- [ ] Bundle ID: `com.authentichadith.app`
- [ ] Fill in `eas.json` → `submit.production.ios`:
  - `appleId`: Your Apple ID email
  - `ascAppId`: The numeric App Store Connect app ID
  - `appleTeamId`: Your Apple Developer Team ID
- [ ] Create in-app purchase products matching your RevenueCat offerings
- [ ] Set up a Subscription Group for the Pro tier
- [ ] Fill in App Store listing:
  - **Name**: Authentic Hadith
  - **Subtitle**: Learn From Verified Sources
  - **Category**: Education (primary), Reference (secondary)
  - **Age Rating**: 4+ (no objectionable content)
  - **Description** (see below)
  - **Keywords** (see below)
  - **Support URL**: https://v0-authentic-hadith.vercel.app/contact
  - **Privacy Policy URL**: https://v0-authentic-hadith.vercel.app/privacy

### 4. Google Play Console

- [ ] Create a new app in [Google Play Console](https://play.google.com/console)
- [ ] Package: `com.authentichadith.app`
- [ ] Generate a service account key and save the JSON file
- [ ] Set path in `eas.json` → `submit.production.android.serviceAccountKeyPath`
- [ ] Create in-app products/subscriptions matching RevenueCat offerings
- [ ] Fill in Play Store listing (same description/keywords as iOS)
- [ ] Complete the Data Safety questionnaire
- [ ] **Privacy Policy URL**: https://v0-authentic-hadith.vercel.app/privacy

### 5. Screenshots

You need screenshots for both stores. Take them from the deployed web app running
in a mobile browser or from the EAS development build.

**Apple App Store (required sizes):**
- 6.7" Display (iPhone 15 Pro Max): 1290 x 2796 px
- 6.5" Display (iPhone 14 Plus): 1284 x 2778 px
- 5.5" Display (iPhone 8 Plus): 1242 x 2208 px (if supporting older devices)
- iPad Pro 12.9" 6th gen: 2048 x 2732 px (required since `supportsTablet: true`)

**Google Play (required):**
- Phone: min 320px, max 3840px, 16:9 aspect ratio recommended
- 7" Tablet: recommended
- 10" Tablet: recommended

**Recommended screenshot pages:**
1. Home dashboard with daily hadith
2. Collections browsing (Sahih al-Bukhari)
3. Hadith detail view with Arabic + English
4. AI Assistant chat
5. Search results
6. My Hadith / bookmarks

### 6. App Icons

The current icons in `assets/` are used. Verify they meet requirements:
- **iOS**: 1024x1024 px, no transparency, no rounded corners (system adds them)
- **Android**: 512x512 px adaptive icon (foreground on transparent background)

---

## Store Description

Use this for both App Store and Play Store:

> **Authentic Hadith - Learn From Verified Sources**
>
> Explore the wisdom of Prophet Muhammad (PBUH) through verified hadith
> collections. Access 36,000+ authenticated hadiths from all eight major
> collections including Sahih al-Bukhari, Sahih Muslim, Jami at-Tirmidhi,
> and more.
>
> FEATURES:
> - Browse all 8 major hadith collections with Arabic text and English translation
> - Full-text search across 36,000+ hadiths
> - Daily hadith with curated Sahih-graded selections
> - AI-powered study assistant for deeper understanding
> - Structured learning paths for beginners to advanced students
> - Stories of the Sahaba and Prophets
> - 365 daily Sunnah practices
> - Personal library with bookmarks, folders, and notes
> - Shareable hadith cards in beautiful designs
> - Knowledge quizzes to test your understanding
> - Private reflection journal
> - Progress tracking with achievements and streaks
> - Dark mode support
> - Hadith grading (Sahih, Hasan, Da'if) with color coding
>
> Built with respect for Islamic scholarship. AI features include transparency
> disclaimers and are designed to supplement — never replace — traditional
> Islamic learning.
>
> Free to use with optional Pro subscription for unlimited AI features,
> advanced study tools, and unlimited saves.

## Store Keywords (iOS, comma-separated, max 100 chars)

```
hadith,islam,quran,sunnah,bukhari,muslim,prophet,dua,islamic,arabic
```

---

## Build & Submit Commands

```bash
# Install dependencies
npm install

# Development build (test on simulator)
eas build --profile development --platform ios

# Preview build (test on real device via TestFlight)
eas build --profile preview --platform ios

# Production build
eas build --profile production --platform ios
eas build --profile production --platform android

# Submit to stores
eas submit --platform ios --latest
eas submit --platform android --latest

# Build + Submit in one step
eas build --profile production --platform ios --auto-submit
eas build --profile production --platform android --auto-submit
```

---

## Architecture

```
expo-wrapper/
├── app/
│   ├── _layout.tsx      # Root layout (SafeArea, RevenueCat, StatusBar)
│   └── index.tsx        # WebView screen (loads v0-authentic-hadith.vercel.app)
├── providers/
│   └── RevenueCatProvider.tsx  # RevenueCat SDK initialization & context
├── assets/              # App icons and splash screen
├── app.json             # Expo config (bundle ID, plugins, store metadata)
├── eas.json             # EAS Build & Submit config
└── package.json
```

**How it works:**
1. The Expo app renders a full-screen `WebView` pointing to the deployed Next.js app
2. The web app detects it's inside a native shell via `window.__IS_NATIVE_APP__`
3. When the user hits a paywall, the web app calls `showNativePaywall()` from `lib/native-bridge.ts`
4. The native shell presents RevenueCat's native paywall UI
5. Purchase results are sent back to the web app via `CustomEvent`
6. User authentication is synced between Supabase (web) and RevenueCat (native) via `USER_LOGIN`/`USER_LOGOUT` messages
