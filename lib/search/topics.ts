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
 * Returns up to 4 search terms: the original query, the canonical topic (if found),
 * and two key synonyms. Keeps OR conditions manageable in SQL queries.
 */
export function getSearchTerms(query: string): string[] {
  const terms: string[] = [query]
  const topic = detectTopic(query)
  if (topic) {
    if (topic.toLowerCase() !== query.toLowerCase()) terms.push(topic)
    const synonyms = TOPIC_SYNONYMS[topic] || []
    // Add first Arabic/primary synonym and one more
    if (synonyms[0] && !terms.includes(synonyms[0])) terms.push(synonyms[0])
    if (synonyms[1] && !terms.includes(synonyms[1])) terms.push(synonyms[1])
  }
  return [...new Set(terms)]
}
