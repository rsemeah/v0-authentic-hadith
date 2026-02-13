"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trophy, Star, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PathCompletionModalProps {
  pathTitle: string
  totalLessons: number
  onClose: () => void
}

export function PathCompletionModal({ pathTitle, totalLessons, onClose }: PathCompletionModalProps) {
  const router = useRouter()
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-10px",
                backgroundColor: ["#C5A059", "#1B5E43", "#3b82f6", "#7c3aed", "#f59e0b"][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <div className="relative bg-background border border-[#C5A059]/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Trophy icon */}
        <div className="w-20 h-20 rounded-full bg-[#C5A059]/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-10 h-10 text-[#C5A059]" />
        </div>

        <h2 className="text-xl font-bold text-foreground mb-2">Path Completed!</h2>
        <p className="text-sm text-muted-foreground mb-4">
          You completed all {totalLessons} lessons in
        </p>
        <p className="text-lg font-semibold text-[#C5A059] mb-6">{pathTitle}</p>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1 mb-6">
          {[1, 2, 3].map((i) => (
            <Star
              key={i}
              className="w-6 h-6 text-[#C5A059] fill-[#C5A059]"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              onClose()
              router.push("/learn")
            }}
            className="w-full px-4 py-2.5 rounded-lg bg-[#C5A059] text-white text-sm font-medium hover:bg-[#B8934D] transition-colors flex items-center justify-center gap-2"
          >
            Explore More Paths
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Stay Here
          </button>
        </div>
      </div>
    </div>
  )
}
