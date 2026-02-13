"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Moon, Globe, Shield, HelpCircle, Star, ChevronDown, Info, ChevronRight, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteText, setDeleteText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const toggleSection = (id: ExpandedSection) => {
    setExpanded(expanded === id ? null : id)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full bg-background border border-border flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="space-y-3">
          {settingsItems.map((item) => (
            <div key={item.id} className="rounded-xl overflow-hidden border border-border bg-card">
              {/* Section Header - clickable to expand/collapse */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleSection(item.id)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSection(item.id) } }}
                className="w-full p-4 flex items-center gap-4 cursor-pointer active:bg-muted/50 transition-colors"
              >
                <div className="w-11 h-11 rounded-lg bg-[#C5A059]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#C5A059]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                    expanded === item.id ? "rotate-180" : ""
                  }`}
                />
              </div>

              {/* Expanded Content - NOT inside a button, so child buttons work */}
              {expanded === item.id && (
                <div className="px-4 pb-4">
                  {item.id === "appearance" && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-4 mt-3">
                        Choose how Authentic Hadith looks to you
                      </p>
                      <ThemeToggle variant="settings" />
                    </div>
                  )}

                  {item.id === "notifications" && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mt-3">
                        Push notifications coming soon! We&apos;ll notify you about daily hadiths and reminders.
                      </p>
                    </div>
                  )}

                  {item.id === "language" && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mt-3">
                        Language selection coming soon. Currently showing English translations with Arabic text.
                      </p>
                    </div>
                  )}

                  {item.id === "privacy" && (
                    <div className="pt-2 border-t border-border space-y-4">
                      <p className="text-sm text-muted-foreground mt-3">
                        Your data is stored securely. You can delete your account and all associated data below.
                      </p>
                      {!showDeleteConfirm ? (
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(true)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete My Account
                        </button>
                      ) : (
                        <div className="p-4 rounded-lg border border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 space-y-3">
                          <p className="text-sm font-medium text-red-700 dark:text-red-400">
                            This will permanently delete your account and all data (saved hadiths, progress, notes, subscription). This cannot be undone.
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Type <span className="font-mono font-semibold">DELETE</span> to confirm:
                          </p>
                          <input
                            type="text"
                            value={deleteText}
                            onChange={(e) => { setDeleteText(e.target.value); setDeleteError(null) }}
                            placeholder="Type DELETE"
                            className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-mono"
                            autoComplete="off"
                          />
                          {deleteError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={deleteText !== "DELETE" || isDeleting}
                              onClick={async () => {
                                setIsDeleting(true)
                                setDeleteError(null)
                                try {
                                  const res = await fetch("/api/delete-account", { method: "POST" })
                                  const body = await res.json()
                                  if (!res.ok) throw new Error(body.error || "Deletion failed")
                                  router.push("/login?deleted=1")
                                } catch (err) {
                                  setDeleteError(err instanceof Error ? err.message : "Deletion failed")
                                  setIsDeleting(false)
                                }
                              }}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                            >
                              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                              {isDeleting ? "Deleting..." : "Permanently Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { setShowDeleteConfirm(false); setDeleteText(""); setDeleteError(null) }}
                              className="px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {item.id === "help" && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-sm text-muted-foreground mt-3">
                        {"Need help? Contact us at support@authentichadith.com"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* About & Premium Links */}
        <Link
          href="/about"
          className="mt-3 w-full rounded-xl p-4 border border-border bg-card flex items-center gap-4 hover:border-[#C5A059]/50 active:bg-muted/50 transition-colors"
        >
          <div className="w-11 h-11 rounded-lg bg-[#C5A059]/10 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-[#C5A059]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">About Authentic Hadith</h3>
            <p className="text-sm text-muted-foreground">Mission, sources, AI policy & more</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </Link>

        <button
          type="button"
          onClick={() => router.push("/pricing")}
          className="mt-3 w-full rounded-xl p-4 border border-border bg-card flex items-center gap-4 hover:border-[#C5A059]/50 active:bg-muted/50 transition-colors text-left"
        >
          <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-foreground">Upgrade to Premium</h3>
            <p className="text-sm text-muted-foreground">AI explanations, advanced search & more</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </button>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Authentic Hadith v1.0.0</p>
          <p className="mt-1">Made with care for the Muslim community</p>
        </div>
      </main>
    </div>
  )
}
