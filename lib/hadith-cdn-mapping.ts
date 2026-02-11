export const CDN_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1"

export interface CollectionConfig {
  slug: string
  name_en: string
  name_ar: string
  scholar: string
  scholar_dates: string
  editions: { english: string; arabic: string }
  is_featured: boolean
}

export const COLLECTION_MAPPING: Record<string, CollectionConfig> = {
  "sahih-bukhari": {
    slug: "sahih-bukhari",
    name_en: "Sahih al-Bukhari",
    name_ar: "\u0635\u062d\u064a\u062d \u0627\u0644\u0628\u062e\u0627\u0631\u064a",
    scholar: "Imam Muhammad al-Bukhari",
    scholar_dates: "810\u2013870 CE",
    editions: { english: "eng-bukhari", arabic: "ara-bukhari" },
    is_featured: true,
  },
  "sahih-muslim": {
    slug: "sahih-muslim",
    name_en: "Sahih Muslim",
    name_ar: "\u0635\u062d\u064a\u062d \u0645\u0633\u0644\u0645",
    scholar: "Imam Muslim ibn al-Hajjaj",
    scholar_dates: "815\u2013875 CE",
    editions: { english: "eng-muslim", arabic: "ara-muslim" },
    is_featured: true,
  },
  "jami-tirmidhi": {
    slug: "jami-tirmidhi",
    name_en: "Jami at-Tirmidhi",
    name_ar: "\u062c\u0627\u0645\u0639 \u0627\u0644\u062a\u0631\u0645\u0630\u064a",
    scholar: "Imam Abu Isa at-Tirmidhi",
    scholar_dates: "824\u2013892 CE",
    editions: { english: "eng-tirmidhi", arabic: "ara-tirmidhi" },
    is_featured: true,
  },
  "sunan-abu-dawud": {
    slug: "sunan-abu-dawud",
    name_en: "Sunan Abu Dawud",
    name_ar: "\u0633\u0646\u0646 \u0623\u0628\u064a \u062f\u0627\u0648\u062f",
    scholar: "Imam Abu Dawud as-Sijistani",
    scholar_dates: "817\u2013889 CE",
    editions: { english: "eng-abudawud", arabic: "ara-abudawud" },
    is_featured: true,
  },
  "sunan-nasai": {
    slug: "sunan-nasai",
    name_en: "Sunan an-Nasai",
    name_ar: "\u0633\u0646\u0646 \u0627\u0644\u0646\u0633\u0627\u0626\u064a",
    scholar: "Imam Ahmad an-Nasai",
    scholar_dates: "829\u2013915 CE",
    editions: { english: "eng-nasai", arabic: "ara-nasai" },
    is_featured: true,
  },
  "sunan-ibn-majah": {
    slug: "sunan-ibn-majah",
    name_en: "Sunan Ibn Majah",
    name_ar: "\u0633\u0646\u0646 \u0627\u0628\u0646 \u0645\u0627\u062c\u0647",
    scholar: "Imam Ibn Majah al-Qazwini",
    scholar_dates: "824\u2013887 CE",
    editions: { english: "eng-ibnmajah", arabic: "ara-ibnmajah" },
    is_featured: true,
  },
  "muwatta-malik": {
    slug: "muwatta-malik",
    name_en: "Muwatta Malik",
    name_ar: "\u0645\u0648\u0637\u0623 \u0645\u0627\u0644\u0643",
    scholar: "Imam Malik ibn Anas",
    scholar_dates: "711\u2013795 CE",
    editions: { english: "eng-malik", arabic: "ara-malik" },
    is_featured: false,
  },
  "musnad-ahmad": {
    slug: "musnad-ahmad",
    name_en: "Musnad Ahmad",
    name_ar: "\u0645\u0633\u0646\u062f \u0623\u062d\u0645\u062f",
    scholar: "Imam Ahmad ibn Hanbal",
    scholar_dates: "780\u2013855 CE",
    editions: { english: "eng-ahmad", arabic: "ara-musnadahmad" },
    is_featured: false,
  },
}

export const ALL_COLLECTION_SLUGS = Object.keys(COLLECTION_MAPPING)
