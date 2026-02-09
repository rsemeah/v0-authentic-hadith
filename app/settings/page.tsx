"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Moon, Globe, Shield, HelpCircle, Star, ChevronDown } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { ThemeToggle } from "@/components/ui/theme-toggle"

type ExpandedSection = "appearance" | "notifications" | "language" | "privacy" | "help" | null

const settingsItems = [
  { id: "notifications" as const, icon: Bell, label: "Notifications", description: "Manage push notifications" },
  { id: "appearance" as const, icon: Moon, label: "Appearance", description: "Dark mode and display settings" },
  { id: "language" as const, icon: Globe, label: "Language", description: "Change app language" },
  { id: "privacy" as const, icon: Shield, label: "Privacy & Security", description: "Manage your data" },
  { id: "help" as const, icon: HelpCircle, label: "Help & Support", description: "Get help and contact us" },
]

export default function SettingsPage() {
  const router = useRouter()
  const [expanded, setExpanded] = useState<ExpandedSection>("appearance")

  const toggleSection = (id: ExpandedSection) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="min-h-screen marble-bg dark:bg-[#111827] pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] dark:border-[#374151] bg-[#F8F6F2]/95 dark:bg-[#1f2937]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] dark:bg-[#374151] border border-[#e5e7eb] dark:border-[#4b5563] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280] dark:text-[#9ca3af]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1a1f36] dark:text-white">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3">
          {settingsItems.map((item) => (
            <div key={item.id} className="gold-border dark:border-[#374151] rounded-xl overflow-hidden">
              <button
                onClick={() => toggleSection(item.id)}
                className="w-full p-4 premium-card dark:bg-[#1f2937] flex items-center gap-4 hover:-translate-y-0.5 transition-transform text-left"
              >
                <div className="w-10 h-10 rounded-lg gold-icon-bg dark:bg-[#C5A059]/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[#1a1f36] dark:text-white">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-[#6b7280] transition-transform duration-200 ${
                    expanded === item.id ? "rotate-180" : ""
                  }`} 
                />
              </button>
              
              {/* Expanded Content */}
              {expanded === item.id && (
                <div className="px-4 pb-4 bg-white dark:bg-[#1f2937]">
                  {item.id === "appearance" && (
                    <div className="pt-2 border-t border-[#e5e7eb] dark:border-[#374151]">
                      <p className="text-sm text-muted-foreground mb-4 mt-3">
                        Choose how Authentic Hadith looks to you
                      </p>
                      <ThemeToggle variant="settings" />
                    </div>
                  )}
                  
                  {item.id === "notifications" && (
                    <div className="pt-2 border-t border-[#e5e7eb] dark:border-[#374151]">
                      <p className="text-sm text-muted-foreground mt-3">
                        Push notifications coming soon! We&apos;ll notify you about daily hadiths and reminders.
                      </p>
                    </div>
                  )}
                  
                  {item.id === "language" && (
                    <div className="pt-2 border-t border-[#e5e7eb] dark:border-[#374151]">
                      <p className="text-sm text-muted-foreground mt-3">
                        Language selection coming soon. Currently showing English translations with Arabic text.
                      </p>
                    </div>
                  )}
                  
                  {item.id === "privacy" && (
                    <div className="pt-2 border-t border-[#e5e7eb] dark:border-[#374151]">
                      <p className="text-sm text-muted-foreground mt-3">
                        Your data is stored securely. You can delete your account and all associated data at any time from your profile settings.
                      </p>
                    </div>
                  )}
                  
                  {item.id === "help" && (
                    <div className="pt-2 border-t border-[#e5e7eb] dark:border-[#374151]">
                      <p className="text-sm text-muted-foreground mt-3">
                        Need help? Contact us at support@authentichadith.com
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Premium & Support */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-[#6b7280] dark:text-[#9ca3af] uppercase tracking-wider mb-3 px-1">
            Premium & Support
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/pricing")}
              className="w-full gold-border dark:border-[#374151] rounded-xl p-4 premium-card dark:bg-[#1f2937] flex items-center gap-4 hover:-translate-y-0.5 transition-transform text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#1a1f36] dark:text-white">Upgrade to Premium</h3>
                <p className="text-sm text-muted-foreground">AI explanations, advanced search & more</p>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Authentic Hadith v1.0.0</p>
          <p className="mt-1">Made with care for the Muslim community</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
