"use client"

import React from "react"

import { useState } from "react"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const COLLECTIONS = [
  { id: "bukhari", name: "Sahih Bukhari", count: "7,563 hadiths" },
  { id: "muslim", name: "Sahih Muslim", count: "7,500 hadiths" },
  { id: "tirmidhi", name: "Sunan at-Tirmidhi", count: "3,956 hadiths" },
  { id: "abudawud", name: "Sunan Abu Dawud", count: "5,274 hadiths" },
  { id: "nasai", name: "Sunan an-Nasa'i", count: "5,761 hadiths" },
  { id: "ibnmajah", name: "Sunan Ibn Majah", count: "4,341 hadiths" },
]

const LANGUAGES = [
  { id: "english", label: "English", icon: "🇬🇧" },
  { id: "arabic", label: "العربية", icon: "🇸🇦" },
  { id: "both", label: "Both", icon: "🌐" },
]

const LEARNING_LEVELS = ["Beginner", "Intermediate", "Advanced"]

interface StepPreferencesProps {
  data: {
    language: string
    collections: string[]
    learningLevel: string
  }
  onUpdate: (data: Partial<StepPreferencesProps["data"]>) => void
}

export function StepPreferences({ data, onUpdate }: StepPreferencesProps) {
  const activeIndex = Math.max(0, LEARNING_LEVELS.indexOf(data.learningLevel))
  const [sliderValue, setSliderValue] = useState<number>(activeIndex * 50);

  const handleLevelSelect = (level: string) => {
    onUpdate({ learningLevel: level })
  }

  const toggleCollection = (collectionId: string) => {
    const updated = data.collections.includes(collectionId)
      ? data.collections.filter((c) => c !== collectionId)
      : [...data.collections, collectionId]
    onUpdate({ collections: updated })
  }

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setSliderValue(value);
    const levelIndex = Math.floor(value / 50);
    if (levelIndex >= 0 && levelIndex < LEARNING_LEVELS.length) {
      handleLevelSelect(LEARNING_LEVELS[levelIndex]);
    }
  }

  return (
    <div className="space-y-8">
      {/* Heading */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#1a1f36] mb-2">Customize your experience</h2>
        <p className="text-muted-foreground">Set your preferences to personalize your learning journey</p>
      </div>

      {/* Language Preference */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#2C2416]">Preferred Language</label>
        <div className="grid grid-cols-3 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => onUpdate({ language: lang.id })}
              className={cn(
                "relative p-4 rounded-xl border-2 transition-all duration-200",
                "hover:-translate-y-0.5",
                data.language === lang.id
                  ? "border-[#C5A059] bg-[#F8F6F2]"
                  : "border-[#e5e7eb] bg-white hover:border-[#d4d4d8]",
              )}
            >
              {data.language === lang.id && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full gold-checkbox flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
              <div className="text-2xl mb-2">{lang.icon}</div>
              <div className="text-sm font-medium text-[#1a1f36]">{lang.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Collections of Interest */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-[#2C2416]">Collections of Interest</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLLECTIONS.map((collection) => {
            const isSelected = data.collections.includes(collection.id)
            return (
              <button
                key={collection.id}
                type="button"
                onClick={() => toggleCollection(collection.id)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all",
                  "hover:bg-[#fafaf9] text-left",
                  isSelected ? "border-[#C5A059] bg-[#F8F6F2]" : "border-[#e5e7eb]",
                )}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-all",
                    isSelected ? "gold-checkbox" : "border border-[#d4d4d8]",
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#1a1f36]">{collection.name}</div>
                  <div className="text-xs text-muted-foreground">{collection.count}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Learning Level Toggle */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-[#2C2416]">Learning Level</label>
        <div className="relative flex items-center bg-[#F3F0EA] rounded-xl p-1" role="radiogroup" aria-label="Select your learning level">
          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out"
            style={{
              width: `calc(${100 / LEARNING_LEVELS.length}% - 4px)`,
              left: `calc(${(activeIndex * 100) / LEARNING_LEVELS.length}% + 2px)`,
              background: "linear-gradient(135deg, #C5A059 0%, #D4B06A 100%)",
              boxShadow: "0 2px 8px rgba(197, 160, 89, 0.35)",
            }}
          />
          {LEARNING_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={data.learningLevel === level}
              onClick={() => handleLevelSelect(level)}
              className={cn(
                "relative z-10 flex-1 py-2.5 text-sm font-medium rounded-lg text-center transition-colors duration-200",
                data.learningLevel === level
                  ? "text-white"
                  : "text-[#6B6455] hover:text-[#2C2416]",
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
