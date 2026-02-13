"use client"

import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleSignOut = async () => {
    // Clear server-side session cookies first
    await fetch("/api/auth/signout", { method: "POST" })
    // Then clear client-side session
    await supabase.auth.signOut({ scope: "global" })
    document.cookie = "qbos_onboarded=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    router.push("/login")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={handleSignOut} className="border-border hover:bg-muted bg-transparent">
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}
