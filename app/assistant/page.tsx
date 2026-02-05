"use client"

import React from "react"

import { Suspense, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Bot, ChevronLeft, Send, Sparkles, Loader2 } from "lucide-react"
import { useChat } from "@ai-sdk/react"
import { BottomNavigation } from "@/components/home/bottom-navigation"

const promptTemplates = [
  { label: "Explain the hadith about intentions", icon: "📖" },
  { label: "Find hadiths about prayer", icon: "🤲" },
  { label: "What makes a hadith authentic?", icon: "🔗" },
  { label: "Who is Prophet Mohammed?", icon: "⚖️" },
]

function AssistantContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialPrompt = searchParams.get("prompt") || ""
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, error } = useChat({
    api: "/api/chat",
    initialInput: initialPrompt,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleTemplateClick = (template: string) => {
    setInput(template)
  }

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((input || "").trim() && !isLoading) {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1B5E43] to-[#2D7A5B] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-[#1a1f36]">AI Assistant</h1>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-6 w-full overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1B5E43] to-[#2D7A5B] flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-8 h-8 text-[#E8C77D]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1a1f36] mb-2 text-balance">How can I help you today?</h2>
            <p className="text-[#6b7280] mb-2">
              Ask me anything about hadiths, their meanings, or Islamic teachings.
            </p>
            <p className="text-xs text-[#9ca3af] mb-8">
              I only answer using authenticated hadith. If none are found, I will say so.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {promptTemplates.map((template, i) => (
                <button
                  key={i}
                  onClick={() => handleTemplateClick(template.label)}
                  className="gold-border rounded-xl p-4 premium-card text-left hover:-translate-y-0.5 transition-transform"
                >
                  <span className="text-xl mb-2 block">{template.icon}</span>
                  <span className="text-sm text-[#1a1f36]">{template.label}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-gradient-to-br from-[#1B5E43] to-[#2D7A5B] text-white"
                      : "gold-border premium-card text-[#1a1f36]"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="gold-border premium-card rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                  <span className="text-sm text-[#6b7280]">Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-red-50 border border-red-200 text-red-700 max-w-[85%]">
                  <p className="text-sm">Something went wrong. Please try again.</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input */}
      <div className="sticky bottom-20 md:bottom-0 bg-[#F8F6F2] border-t border-[#e5e7eb] p-4">
        <form onSubmit={onFormSubmit} className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about hadiths..."
            className="flex-1 px-4 py-3 rounded-xl border border-[#e5e7eb] bg-white focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 outline-none transition-all text-[#1a1f36]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!(input || "").trim() || isLoading}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1B5E43] to-[#2D7A5B] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            aria-label="Send message"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>

      <BottomNavigation />
    </div>
  )
}

export default function AssistantPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen marble-bg flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AssistantContent />
    </Suspense>
  )
}
