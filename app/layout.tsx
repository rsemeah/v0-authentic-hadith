import type React from "react"
import type { Metadata, Viewport } from "next"
import { Cinzel, Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { AppShell } from "@/components/layout/app-shell"
import "./globals.css"

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "500", "600", "700"],
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Authentic Hadith - Learn From Verified Sources",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://authentichadith.app"),
  description:
    "Access verified collections of prophetic traditions, meticulously authenticated and preserved for generations of knowledge seekers.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#1B5E43",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body className={`${cinzel.variable} ${geist.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
