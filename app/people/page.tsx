"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, UserPlus, UserCheck, Users, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface UserResult {
  user_id: string
  name: string | null
  avatar_url: string | null
  bio: string | null
}

interface FriendRequest {
  id: string
  sender_id: string
  receiver_id?: string
  status: string
  created_at: string
}

export default function PeoplePage() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [followingSet, setFollowingSet] = useState<Set<string>>(new Set())
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([])
  const [activeTab, setActiveTab] = useState<"search" | "requests">("search")

  // Load following list and pending friend requests
  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: follows }, requestsRes] = await Promise.all([
        supabase.from("user_follows").select("following_id").eq("follower_id", user.id),
        fetch("/api/social/friends?type=received"),
      ])

      if (follows) setFollowingSet(new Set(follows.map((f) => f.following_id)))

      if (requestsRes.ok) {
        const data = await requestsRes.json()
        setPendingRequests(data.requests || [])
      }
    }
    load()
  }, [supabase])

  const handleSearch = useCallback(async () => {
    if (query.length < 2) {
      setResults([])
      return
    }

    setSearching(true)
    try {
      const res = await fetch(`/api/social/users?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.users || [])
      }
    } catch {
      // silent
    }
    setSearching(false)
  }, [query])

  useEffect(() => {
    const timer = setTimeout(handleSearch, 300)
    return () => clearTimeout(timer)
  }, [handleSearch])

  const handleFollow = async (userId: string) => {
    const isFollowing = followingSet.has(userId)

    await fetch("/api/social/follow", {
      method: isFollowing ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ following_id: userId }),
    })

    setFollowingSet((prev) => {
      const next = new Set(prev)
      if (isFollowing) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const handleFriendResponse = async (requestId: string, action: "accept" | "reject") => {
    await fetch("/api/social/friends", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ request_id: requestId, action }),
    })

    setPendingRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => router.back()} className="p-1">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-lg font-semibold text-foreground">People</h1>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#C5A059] text-white">
                {pendingRequests.length}
              </span>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setActiveTab("search")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "search" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <Search className="w-4 h-4" />
              Search
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === "requests" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              <Users className="w-4 h-4" />
              Requests
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full text-xs bg-[#C5A059] text-white flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {activeTab === "search" && (
          <>
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by name..."
                className="w-full pl-10 pr-4 py-3 rounded-xl premium-input text-sm"
                autoFocus
              />
            </div>

            {/* Results */}
            {searching && (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!searching && results.length > 0 && (
              <div className="space-y-2">
                {results.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center gap-3 p-3 rounded-xl premium-card hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/people/${user.user_id}`)}
                  >
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
                      ) : (
                        <Users className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{user.name || "Anonymous"}</p>
                      {user.bio && <p className="text-xs text-muted-foreground truncate">{user.bio}</p>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFollow(user.user_id)
                      }}
                      className={cn(
                        "flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium transition-colors",
                        followingSet.has(user.user_id)
                          ? "bg-muted text-muted-foreground"
                          : "bg-[#1B5E43] text-white hover:bg-[#2D7A5B]",
                      )}
                    >
                      {followingSet.has(user.user_id) ? (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5" />
                          Follow
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!searching && query.length >= 2 && results.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No users found for &quot;{query}&quot;</p>
              </div>
            )}

            {query.length < 2 && (
              <div className="text-center py-12">
                <Search className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Search for people to follow and connect with</p>
              </div>
            )}
          </>
        )}

        {activeTab === "requests" && (
          <>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingRequests.map((req) => (
                  <FriendRequestCard key={req.id} request={req} onRespond={handleFriendResponse} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function FriendRequestCard({
  request,
  onRespond,
}: {
  request: FriendRequest
  onRespond: (id: string, action: "accept" | "reject") => void
}) {
  const supabase = getSupabaseBrowserClient()
  const [profile, setProfile] = useState<{ name: string | null; avatar_url: string | null } | null>(null)

  useEffect(() => {
    supabase
      .from("profiles")
      .select("name, avatar_url")
      .eq("user_id", request.sender_id)
      .single()
      .then(({ data }) => setProfile(data))
  }, [supabase, request.sender_id])

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl premium-card">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
        ) : (
          <Users className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{profile?.name || "Anonymous"}</p>
        <p className="text-xs text-muted-foreground">Wants to be friends</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onRespond(request.id, "accept")}
          className="text-xs px-3 py-1.5 rounded-full font-medium bg-[#1B5E43] text-white hover:bg-[#2D7A5B] transition-colors"
        >
          Accept
        </button>
        <button
          onClick={() => onRespond(request.id, "reject")}
          className="text-xs px-3 py-1.5 rounded-full font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
        >
          Decline
        </button>
      </div>
    </div>
  )
}
