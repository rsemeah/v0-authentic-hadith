"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  UserPlus,
  UserCheck,
  Users,
  MessageCircle,
  Heart,
  User,
  UserMinus,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UserProfile {
  user_id: string
  name: string | null
  avatar_url: string | null
  bio: string | null
  followers_count: number
  following_count: number
  friends_count: number
  is_following: boolean
  friend_status: string | null
  friend_request_sender: string | null
  is_self: boolean
}

export default function UserProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/social/users?id=${userId}`)
      if (res.ok) {
        setProfile(await res.json())
      }
      setLoading(false)
    }
    load()
  }, [userId])

  const handleFollow = async () => {
    if (!profile) return
    setActionLoading(true)

    await fetch("/api/social/follow", {
      method: profile.is_following ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ following_id: userId }),
    })

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            is_following: !prev.is_following,
            followers_count: prev.followers_count + (prev.is_following ? -1 : 1),
          }
        : null,
    )
    setActionLoading(false)
  }

  const handleFriendRequest = async () => {
    if (!profile) return
    setActionLoading(true)

    const res = await fetch("/api/social/friends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiver_id: userId }),
    })

    if (res.ok) {
      const data = await res.json()
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              friend_status: data.auto_accepted ? "accepted" : "pending",
              friend_request_sender: prev.user_id,
            }
          : null,
      )
    } else if (res.status === 403) {
      // Not premium — could show upgrade modal
      router.push("/pricing")
    }
    setActionLoading(false)
  }

  const handleAcceptFriend = async () => {
    if (!profile) return
    setActionLoading(true)

    // Need to find the request ID first
    const listRes = await fetch("/api/social/friends?type=received")
    if (listRes.ok) {
      const data = await listRes.json()
      const request = data.requests?.find((r: { sender_id: string }) => r.sender_id === userId)
      if (request) {
        await fetch("/api/social/friends", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_id: request.id, action: "accept" }),
        })
        setProfile((prev) => (prev ? { ...prev, friend_status: "accepted" } : null))
      }
    }
    setActionLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground truncate">{profile.name || "Profile"}</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Card */}
        <div className="premium-card rounded-xl p-6 text-center mb-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden mx-auto mb-4">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" crossOrigin="anonymous" />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-1">{profile.name || "Anonymous"}</h2>
          {profile.bio && <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>}

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{profile.followers_count}</p>
              <p className="text-xs text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{profile.following_count}</p>
              <p className="text-xs text-muted-foreground">Following</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">{profile.friends_count}</p>
              <p className="text-xs text-muted-foreground">Friends</p>
            </div>
          </div>

          {/* Action Buttons */}
          {!profile.is_self && (
            <div className="flex justify-center gap-3">
              {/* Follow/Unfollow */}
              <button
                onClick={handleFollow}
                disabled={actionLoading}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
                  profile.is_following
                    ? "bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    : "bg-[#1B5E43] text-white hover:bg-[#2D7A5B]",
                )}
              >
                {profile.is_following ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>

              {/* Friend Request */}
              {profile.friend_status === "accepted" ? (
                <span className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#C5A059]/10 text-[#C5A059]">
                  <UserCheck className="w-4 h-4" />
                  Friends
                </span>
              ) : profile.friend_status === "pending" && profile.friend_request_sender !== userId ? (
                <span className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Request Sent
                </span>
              ) : profile.friend_status === "pending" && profile.friend_request_sender === userId ? (
                <button
                  onClick={handleAcceptFriend}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#C5A059] text-white hover:bg-[#B08A3E] transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  Accept Friend
                </button>
              ) : (
                <button
                  onClick={handleFriendRequest}
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/10 transition-colors disabled:opacity-50"
                >
                  <Users className="w-4 h-4" />
                  Add Friend
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
