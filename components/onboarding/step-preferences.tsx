"use client"

import type React from "react"

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
  const [sliderValue, setSliderValue] = useState(() => {
    const index = LEARNING_LEVELS.indexOf(data.learningLevel)
    return index >= 0 ? index * 50 : 50
  })

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    // Snap to nearest position (0, 50, 100)
    let snappedValue = 50
    if (value < 25) snappedValue = 0
    else if (value > 75) snappedValue = 100
    else snappedValue = 50

    setSliderValue(snappedValue)
    onUpdate({ learningLevel: LEARNING_LEVELS[snappedValue / 50] })
  }

  const toggleCollection = (collectionId: string) => {
    const updated = data.collections.includes(collectionId)
      ? data.collections.filter((c) => c !== collectionId)
      : [...data.collections, collectionId]
    onUpdate({ collections: updated })
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

      {/* Learning Level Slider */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-[#2C2416]">Learning Level</label>
        <div className="px-2">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="gold-slider w-full"
            aria-label="Select your learning level"
          />
          <div className="flex justify-between mt-2">
            {LEARNING_LEVELS.map((level, index) => (
              <span
                key={level}
                className={cn(
                  "text-sm transition-colors",
                  sliderValue === index * 50 ? "text-[#C5A059] font-medium" : "text-muted-foreground",
                )}
              >
                {level}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
