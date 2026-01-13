"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, GraduationCap, BookOpen, Star, Trophy } from "lucide-react"
import { BottomNavigation } from "@/components/home/bottom-navigation"

const learningPaths = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Start your journey with foundational hadiths",
    icon: BookOpen,
    color: "from-[#10b981] to-[#34d399]",
    lessons: 12,
  },
  {
    id: "intermediate",
    title: "Intermediate",
    description: "Deepen your understanding of hadith sciences",
    icon: Star,
    color: "from-[#3b82f6] to-[#60a5fa]",
    lessons: 24,
  },
  {
    id: "advanced",
    title: "Advanced",
    description: "Master the chain of narration and authentication",
    icon: GraduationCap,
    color: "from-[#C5A059] to-[#E8C77D]",
    lessons: 36,
  },
  {
    id: "scholar",
    title: "Scholar Track",
    description: "For serious students of hadith sciences",
    icon: Trophy,
    color: "from-[#1B5E43] to-[#2D7A5B]",
    lessons: 48,
  },
]

export default function LearnPage() {
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
          <h1 className="text-lg font-semibold text-[#1a1f36]">Learning Paths</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <p className="text-muted-foreground mb-6">Choose a learning path that matches your level of knowledge.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {learningPaths.map((path) => (
            <button
              key={path.id}
              className="gold-border rounded-xl p-6 premium-card text-left hover:-translate-y-1 transition-transform group"
            >
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center mb-4`}
              >
                <path.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1f36] mb-1">{path.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
              <span className="text-xs text-[#C5A059] font-medium">{path.lessons} lessons</span>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>More learning paths coming soon!</p>
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}
