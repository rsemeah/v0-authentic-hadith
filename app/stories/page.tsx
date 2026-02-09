"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Users, BookOpen, Heart, Shield, Sword, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Story {
  id: string
  title: string
  subtitle: string
  description: string
  theme: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  sections: StorySection[]
}

interface StorySection {
  id: string
  title: string
  content: string
  hadithRef?: string
  collection?: string
}

const STORIES: Story[] = [
  {
    id: "abu-bakr",
    title: "Abu Bakr al-Siddiq",
    subtitle: "The Truthful",
    description: "The first man to accept Islam, the closest companion, and the first Caliph. His life embodied loyalty, sacrifice, and unwavering faith.",
    theme: "Loyalty & Sacrifice",
    icon: Star,
    color: "text-[#C5A059]",
    bgColor: "bg-[#C5A059]/10",
    sections: [
      {
        id: "conversion",
        title: "The First to Believe",
        content: "Abu Bakr was the first free adult male to accept Islam. When the Prophet (peace be upon him) shared the message with him, he accepted without hesitation. The Prophet said: 'I never invited anyone to Islam who did not have some hesitation -- except Abu Bakr.'",
        hadithRef: "Siyar A'lam al-Nubala",
      },
      {
        id: "cave",
        title: "The Companion of the Cave",
        content: "During the Hijrah, Abu Bakr accompanied the Prophet to the cave of Thawr. When he saw a snake hole, he plugged it with his foot to protect the Prophet. When the Quraysh came searching, the Prophet calmed him: 'Do not grieve, indeed Allah is with us.'",
        hadithRef: "Book 62, Hadith 3653",
        collection: "Sahih Bukhari",
      },
      {
        id: "generosity",
        title: "Complete Sacrifice",
        content: "When the Prophet asked for donations for the expedition to Tabuk, Abu Bakr brought everything he owned. The Prophet asked: 'What have you left for your family?' He replied: 'I have left them Allah and His Messenger.'",
        hadithRef: "Hadith 3675",
        collection: "Jami at-Tirmidhi",
      },
    ],
  },
  {
    id: "umar",
    title: "Umar ibn al-Khattab",
    subtitle: "The Just",
    description: "Known for his justice, strength, and decisive leadership. His conversion strengthened the early Muslim community immensely.",
    theme: "Justice & Strength",
    icon: Shield,
    color: "text-[#1B5E43]",
    bgColor: "bg-[#1B5E43]/10",
    sections: [
      {
        id: "conversion",
        title: "A Dramatic Conversion",
        content: "Umar set out to kill the Prophet but ended up embracing Islam after hearing Surah Taha being recited. His conversion was a turning point -- Muslims could finally pray openly at the Ka'bah.",
        hadithRef: "Book 62",
        collection: "Sahih Bukhari",
      },
      {
        id: "justice",
        title: "Justice as Caliph",
        content: "Umar would walk the streets at night checking on his people. He once said: 'If a lost sheep on the bank of the Euphrates were to die without care, I would fear that Allah would hold me accountable for it.'",
        hadithRef: "Kitab al-Kharaj",
      },
      {
        id: "humility",
        title: "Walking in Humility",
        content: "The Prophet said: 'Among the nations before you there were inspired people, and if there is any such among my Ummah, then it is Umar.'",
        hadithRef: "Book 62, Hadith 3689",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "khadijah",
    title: "Khadijah bint Khuwaylid",
    subtitle: "Mother of the Believers",
    description: "The Prophet's first wife, first believer, and greatest supporter. She spent her wealth for Islam and comforted the Prophet in his hardest moments.",
    theme: "Support & Devotion",
    icon: Heart,
    color: "text-[#dc2626]",
    bgColor: "bg-red-50",
    sections: [
      {
        id: "first-revelation",
        title: "The First to Comfort",
        content: "When the Prophet received the first revelation and came home trembling, it was Khadijah who comforted him: 'By Allah, Allah will never disgrace you. You maintain family ties, bear the burden of the weak, help the poor, serve guests generously, and assist those afflicted by calamity.'",
        hadithRef: "Book 1, Hadith 3",
        collection: "Sahih Bukhari",
      },
      {
        id: "sacrifice",
        title: "Spending for Islam",
        content: "Khadijah spent her entire fortune supporting the Prophet's mission. She was among the wealthiest merchants of Makkah, yet gave everything for the cause of Islam without hesitation.",
      },
      {
        id: "love",
        title: "A Love That Lasted",
        content: "Even years after her passing, the Prophet would remember Khadijah with deep emotion. Aisha said: 'I was never more jealous of any wife of the Prophet than Khadijah, though I never saw her, because the Prophet would always mention her.'",
        hadithRef: "Book 62, Hadith 3818",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "bilal",
    title: "Bilal ibn Rabah",
    subtitle: "The Voice of Islam",
    description: "A formerly enslaved man who endured severe torture for his faith and became the first muezzin, calling believers to prayer with his beautiful voice.",
    theme: "Perseverance & Freedom",
    icon: Sword,
    color: "text-[#7c3aed]",
    bgColor: "bg-purple-50",
    sections: [
      {
        id: "torture",
        title: "Steadfast Under Torture",
        content: "Umayyah ibn Khalaf would place a heavy rock on Bilal's chest under the scorching desert sun, demanding he renounce Islam. Bilal would only repeat: 'Ahad, Ahad' (One, One) -- affirming the oneness of Allah.",
      },
      {
        id: "freedom",
        title: "Abu Bakr's Compassion",
        content: "Abu Bakr purchased Bilal's freedom. When people praised him for it, he said: 'It was Allah who freed him.' Bilal became one of the closest companions of the Prophet.",
      },
      {
        id: "adhan",
        title: "The First Adhan",
        content: "The Prophet chose Bilal to make the call to prayer because of his powerful, melodious voice. He gave the first ever adhan from the rooftop of the Ka'bah after the conquest of Makkah.",
        hadithRef: "Book 10, Hadith 604",
        collection: "Sahih Bukhari",
      },
    ],
  },
  {
    id: "salman",
    title: "Salman al-Farisi",
    subtitle: "The Seeker of Truth",
    description: "Born in Persia, Salman traveled across the known world seeking the truth -- from Zoroastrianism through Christianity until he found Islam.",
    theme: "Search for Truth",
    icon: BookOpen,
    color: "text-[#0369a1]",
    bgColor: "bg-sky-50",
    sections: [
      {
        id: "journey",
        title: "A Journey Across Lands",
        content: "Salman left his wealthy Zoroastrian family in search of truth. He served Christian monks in Syria, each pointing him to the next, until the last one told him: 'A prophet will emerge in the land of Arabia. He will migrate to a land between two lava fields.'",
        hadithRef: "Musnad Ahmad",
      },
      {
        id: "trench",
        title: "The Battle of the Trench",
        content: "It was Salman who suggested digging a trench around Madinah to defend against the confederate army -- a strategy unknown to the Arabs. The Prophet said: 'Salman is one of us, the People of the House.'",
        hadithRef: "Hadith 3932",
        collection: "Jami at-Tirmidhi",
      },
    ],
  },
]

export default function StoriesPage() {
  const router = useRouter()
  const [expandedStory, setExpandedStory] = useState<string | null>("abu-bakr")

  return (
    <div className="min-h-screen marble-bg pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[#e5e7eb] bg-[#F8F6F2]/95 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full bg-[#F8F6F2] border border-[#e5e7eb] flex items-center justify-center hover:border-[#C5A059] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#6b7280]" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#1a1f36]">Stories of the Companions</h1>
            <p className="text-xs text-muted-foreground">Lives that inspire</p>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          The Companions (Sahaba) were the people who lived alongside the Prophet Muhammad (peace be upon him).
          Their stories of faith, courage, sacrifice, and love for Allah continue to soften hearts and inspire
          believers across generations.
        </p>
      </section>

      {/* Stories */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3">
        {STORIES.map((story) => {
          const isExpanded = expandedStory === story.id
          const Icon = story.icon

          return (
            <div
              key={story.id}
              className={cn(
                "rounded-xl border transition-all overflow-hidden",
                isExpanded ? "border-[#C5A059]/30 shadow-sm" : "border-[#e5e7eb]",
              )}
            >
              <button
                onClick={() => setExpandedStory(isExpanded ? null : story.id)}
                className="w-full p-4 flex items-center gap-4 text-left premium-card"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", story.bgColor)}>
                  <Icon className={cn("w-6 h-6", story.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1a1f36]">{story.title}</h3>
                  <p className="text-xs text-[#C5A059] font-medium">{story.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-[#f3f4f6]">
                      {story.theme}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {story.sections.length} parts
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform", isExpanded && "rotate-90")}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-[#e5e7eb]">
                  <div className="p-4 pb-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">{story.description}</p>
                  </div>
                  <div className="divide-y divide-[#f3f4f6]">
                    {story.sections.map((section, idx) => (
                      <div key={section.id} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-5 h-5 rounded-full bg-[#f3f4f6] flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                          <h4 className="text-sm font-semibold text-[#1a1f36]">{section.title}</h4>
                        </div>
                        <p className="text-xs text-[#374151] leading-relaxed mb-2 pl-7">{section.content}</p>
                        {section.collection && section.hadithRef && (
                          <div className="flex items-center gap-2 pl-7">
                            <BookOpen className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">
                              {section.collection} - {section.hadithRef}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </main>
    </div>
  )
}
