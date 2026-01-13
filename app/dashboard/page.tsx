import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { SignOutButton } from "@/components/sign-out-button"
import Image from "next/image"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/images/gemini-generated-image-xw5svjxw5svjxw5s.jpeg"
              alt="Authentic Hadith Logo"
              width={48}
              height={48}
              className="object-contain"
            />
            <h1 className="text-xl font-bold text-foreground">Authentic Hadith</h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-2xl p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-primary font-bold">{user.email?.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Welcome, {user.user_metadata?.full_name || "Knowledge Seeker"}!
          </h2>
          <p className="text-muted-foreground mb-6">{user.email}</p>
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              You have successfully signed in. This dashboard will be your gateway to authentic Hadith collections.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
