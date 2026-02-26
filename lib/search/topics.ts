// TruthSerum v2 - Islamic topic synonym engine
// Expands search queries with Arabic/English synonyms so users can search
// in either language and find matches in both.

export const TOPIC_SYNONYMS: Record<string, string[]> = {
  prayer: ["salah", "salat", "namaz", "worship", "praying", "tahajjud", "fajr", "dhuhr", "asr", "maghrib", "isha", "qiyam"],
  fasting: ["sawm", "siyam", "ramadan", "iftar", "suhoor", "sehri", "fasts", "breaking fast"],
  charity: ["zakat", "sadaqah", "alms", "giving", "donation", "spending", "helping poor", "wealth distribution"],
  washing: ["wudu", "ablution", "ghusl", "tayammum", "purification", "cleansing", "ritual bath", "purity"],
  pilgrimage: ["hajj", "umrah", "mecca", "kaaba", "tawaf", "safa", "marwa", "arafat", "mina"],
  marriage: ["nikah", "wedding", "spouse", "husband", "wife", "marital", "matrimony", "dowry", "mahr"],
  divorce: ["talaq", "khula", "separation", "divorcing", "divorced"],
  parents: ["mother", "father", "obedience", "respect", "honoring parents", "kindness to parents", "birr al walidayn"],
  patience: ["sabr", "perseverance", "steadfastness", "endurance", "forbearance", "resilience"],
  forgiveness: ["maghfirah", "pardon", "mercy", "overlooking", "forgiving others"],
  repentance: ["tawbah", "taubah", "turning back", "seeking forgiveness", "regret", "remorse"],
  prophet: ["muhammad", "messenger", "rasul", "nabi", "sunnah", "prophetic"],
  quran: ["holy quran", "book of allah", "recitation", "revelation", "scripture", "kitab"],
  angels: ["malaikah", "jibril", "gabriel", "angel", "israfil", "mikail"],
  death: ["maut", "dying", "afterlife", "grave", "barzakh", "passing away"],
  judgment: ["qiyamah", "day of judgment", "resurrection", "reckoning", "last day"],
  paradise: ["jannah", "heaven", "gardens", "eternal bliss", "reward", "hereafter"],
  hell: ["jahannam", "hellfire", "punishment", "torment", "fire"],
  knowledge: ["ilm", "learning", "education", "seeking knowledge", "study", "wisdom"],
  faith: ["iman", "belief", "believing", "conviction", "trust in allah", "creed"],
  sincerity: ["ikhlas", "pure intention", "truthfulness", "honesty"],
  humility: ["tawadu", "modesty", "humble", "meekness"],
  arrogance: ["kibr", "pride", "haughtiness", "vanity", "conceit", "boasting"],
  backbiting: ["gheebah", "gossip", "slander", "talking behind back"],
  envy: ["hasad", "jealousy", "covetousness", "envious"],
  greed: ["tamaa", "avarice", "stinginess", "hoarding", "miserliness"],
  anger: ["ghadab", "rage", "fury", "wrath", "temper", "controlling anger"],
  kindness: ["ihsan", "excellence", "benevolence", "compassion", "gentleness"],
  justice: ["adl", "fairness", "equity", "righteousness", "being just"],
  oppression: ["zulm", "injustice", "tyranny", "wrongdoing", "transgression"],
  modesty: ["haya", "shame", "shyness", "bashfulness", "decency", "chastity"],
  gratitude: ["shukr", "thankfulness", "appreciation", "being grateful"],
  trust: ["tawakkul", "reliance", "dependence on allah", "putting trust"],
  hope: ["raja", "optimism", "expectation", "hoping in allah"],
  fear: ["khawf", "awe", "reverence", "fearing allah", "taqwa", "god consciousness"],
  // --- Additional high-value topics ---
  supplication: ["dua", "duaa", "du'a", "invocation", "asking allah", "calling upon allah", "make dua", "supplicating"],
  remembrance: ["dhikr", "zikr", "tasbih", "subhanallah", "alhamdulillah", "allahu akbar", "istighfar", "glorification", "glorify"],
  alcohol: ["khamr", "wine", "intoxicants", "intoxicating", "drinking", "beer", "liquor", "maysir", "gambling", "forbidden drink"],
  shirk: ["polytheism", "idol worship", "associating partners", "idolatry", "false gods", "partners with allah"],
  food: ["halal food", "haram food", "eating", "zabiha", "slaughter", "pork", "forbidden food", "permissible food", "diet"],
}

// Filler phrases to strip from the start of a query before processing
const QUERY_FILLER_PREFIXES: string[] = [
  "what are some hadiths about ",
  "what are hadiths about ",
  "show me hadiths about ",
  "find hadiths about ",
  "is there a hadith about ",
  "are there hadiths about ",
  "what does islam say about ",
  "what did the prophet say about ",
  "tell me about ",
]

/**
 * Strips common Islamic search filler phrases from a query so the meaningful
 * term remains. Handles both prefix removal and inline "hadiths about" patterns.
 *
 * Examples:
 *   "hadiths about patience"          → "patience"
 *   "tell me about fasting"           → "fasting"
 *   "sahih hadiths about anger"       → "sahih anger"   (grade extracted later)
 */
export function stripQueryFillers(query: string): string {
  const lower = query.toLowerCase()

  // Remove a known filler prefix first
  for (const filler of QUERY_FILLER_PREFIXES) {
    if (lower.startsWith(filler)) {
      query = query.slice(filler.length).trim()
      break
    }
  }

  // Remove inline "hadith(s) about/on/regarding/concerning" patterns
  query = query.replace(/\bhadiths?\s+(?:about|on|regarding|concerning|related\s+to)\s+/gi, "")

  // Remove bare "hadith(s)" noise word that may be left over
  query = query.replace(/\bhadiths?\b/gi, "").replace(/\s+/g, " ").trim()

  return query
}

/**
 * Returns the canonical topic name if the query matches a known topic or its synonyms.
 */
export function detectTopic(query: string): string | null {
  const lower = query.toLowerCase()
  for (const [topic, synonyms] of Object.entries(TOPIC_SYNONYMS)) {
    if (lower.includes(topic) || synonyms.some((s) => lower.includes(s.toLowerCase()))) {
      return topic
    }
  }
  return null
}

/**
 * Returns up to 6 search terms: the original query, the canonical topic (if found),
 * and up to 4 of its synonyms. More terms than before (was capped at 4) means better
 * recall for Arabic↔English cross-language searches.
 */
export function getSearchTerms(query: string): string[] {
  const terms = new Set([query])
  const topic = detectTopic(query)
  if (topic) {
    terms.add(topic)
    for (const synonym of TOPIC_SYNONYMS[topic] || []) {
      if (terms.size >= 6) break
      terms.add(synonym)
    }
  }
  return [...terms]
}
