"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCleanTranslation, getCollectionDisplayName } from "@/lib/hadith-utils"

interface SearchSuggestion {
  id: string
  title: string
  collection: string
}

export function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (query.length > 1) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(async () => {
        // Cancel any in-flight request
        abortRef.current?.abort()
        abortRef.current = new AbortController()

        try {
          const res = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`,
            { signal: abortRef.current.signal }
          )
          const data = await res.json()
          setSuggestions(
            (data.results || []).slice(0, 5).map((h: any) => ({
              id: h.id,
              title: getCleanTranslation(h.english_translation).substring(0, 90),
              collection: getCollectionDisplayName(h.collection),
            }))
          )
        } catch {
          // Ignore abort errors
        }
      }, 250)
    } else {
      setSuggestions([])
    }

    return () => clearTimeout(timeoutRef.current)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    router.push(`/hadith/${suggestion.id}`)
  }

  const handleClear = () => {
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "flex items-center gap-3 px-5 py-3 rounded-full bg-background border transition-all",
            isFocused ? "border-[#C5A059] border-2 w-[400px] lg:w-[600px]" : "border-border w-[300px] lg:w-[400px]",
          )}
        >
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder="Search hadiths..."
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border overflow-hidden z-50 max-h-[300px] overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fef3c7] transition-colors text-left"
            >
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{suggestion.title}</p>
                <p className="text-xs text-muted-foreground">{suggestion.collection}</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => router.push(`/search?q=${encodeURIComponent(query)}`)}
            className="w-full flex items-center gap-3 px-4 py-2.5 border-t border-border hover:bg-muted/50 transition-colors text-left"
          >
            <Search className="w-4 h-4 text-[#C5A059] shrink-0" />
            <p className="text-sm text-[#C5A059] font-medium">See all results for &ldquo;{query}&rdquo;</p>
          </button>
        </div>
      )}
    </div>
  )
}
