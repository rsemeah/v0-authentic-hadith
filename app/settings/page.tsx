"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Moon, Globe, Shield, HelpCircle } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"

const settingsItems = [
  { id: "notifications", icon: Bell, label: "Notifications", description: "Manage push notifications" },
  { id: "appearance", icon: Moon, label: "Appearance", description: "Dark mode and display settings" },
  { id: "language", icon: Globe, label: "Language", description: "Change app language" },
  { id: "privacy", icon: Shield, label: "Privacy & Security", description: "Manage your data" },
  { id: "help", icon: HelpCircle, label: "Help & Support", description: "Get help and contact us" },
]

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <h1 className="text-lg font-semibold text-[#1a1f36]">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              className="w-full gold-border rounded-xl p-4 premium-card flex items-center gap-4 hover:-translate-y-0.5 transition-transform text-left"
            >
              <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-[#C5A059]" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#1a1f36]">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            </button>
          ))}
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
