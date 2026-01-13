"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, User, Bookmark, Settings, LogOut } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface UserProfile {
  name: string
  avatar_url: string | null
  school_of_thought: string | null
}

function ProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "profile"
  const supabase = getSupabaseBrowserClient()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [savedHadiths, setSavedHadiths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profileData } = await supabase.from("profiles").select("*").eq("user_id", user.id).single()

        if (profileData) {
          setProfile(profileData)
        }

        if (tab === "saved") {
          const { data: savedData } = await supabase
            .from("saved_hadiths")
            .select(`
              created_at,
              hadiths (*)
            `)
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })

          setSavedHadiths(savedData?.map((s: any) => s.hadiths).filter(Boolean) || [])
        }
      }
      setLoading(false)
    }

    fetchData()
  }, [supabase, tab])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    document.cookie = "qbos_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen marble-bg flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

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
          <h1 className="text-lg font-semibold text-[#1a1f36]">Profile</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Card */}
        <div className="gold-border rounded-xl p-6 premium-card mb-6">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url || "/placeholder.svg"}
                alt={profile.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#C5A059]"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#F8F6F2] border-2 border-[#C5A059] flex items-center justify-center">
                <User className="w-8 h-8 text-[#C5A059]" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-[#1a1f36]">{profile?.name || "User"}</h2>
              {profile?.school_of_thought && (
                <p className="text-sm text-muted-foreground">{profile.school_of_thought}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => router.push("/profile")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === "profile"
                ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                : "bg-[#F8F6F2] border border-[#e5e7eb] text-[#1a1f36]"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => router.push("/profile?tab=saved")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              tab === "saved"
                ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D] text-white"
                : "bg-[#F8F6F2] border border-[#e5e7eb] text-[#1a1f36]"
            }`}
          >
            Saved
          </button>
        </div>

        {tab === "profile" ? (
          <div className="space-y-4">
            <button
              onClick={() => router.push("/settings")}
              className="w-full gold-border rounded-xl p-4 premium-card flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="w-10 h-10 rounded-lg gold-icon-bg flex items-center justify-center">
                <Settings className="w-5 h-5 text-[#C5A059]" />
              </div>
              <span className="font-medium text-[#1a1f36]">Settings</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full border border-red-200 rounded-xl p-4 bg-red-50 flex items-center gap-4 hover:-translate-y-0.5 transition-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-medium text-red-600">Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {savedHadiths.length > 0 ? (
              savedHadiths.map((hadith) => (
                <button
                  key={hadith.id}
                  onClick={() => router.push(`/hadith/${hadith.id}`)}
                  className="w-full gold-border rounded-xl p-4 premium-card text-left hover:-translate-y-0.5 transition-transform"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs font-bold text-white bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]">
                      {hadith.collection}
                    </span>
                  </div>
                  <p className="text-sm text-[#1a1f36] line-clamp-2">{hadith.english_translation}</p>
                </button>
              ))
            ) : (
              <div className="text-center py-12">
                <Bookmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-muted-foreground">No saved hadiths yet</p>
                <p className="text-sm text-muted-foreground mt-1">Tap the bookmark icon on any hadith to save it</p>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  )
}
