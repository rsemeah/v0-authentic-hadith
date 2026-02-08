/**
 * Parses english_translation field which may be:
 * - Plain text: "The Prophet said..."
 * - JSON string: '{"narrator":"Anas:","text":"The Prophet said..."}'
 *
 * Returns { narrator, text } with clean values.
 */
export function parseEnglishTranslation(raw: string | null | undefined): {
  narrator: string
  text: string
} {
  if (!raw) return { narrator: "", text: "" }

  // Try JSON parse if it looks like JSON
  if (raw.startsWith("{") && raw.includes('"text"')) {
    try {
      const parsed = JSON.parse(raw)
      const narrator = (parsed.narrator || "").replace(/^Narrated\s+/i, "").replace(/:$/, "").trim()
      const text = (parsed.text || "")
        .replace(/\\n/g, "\n")
        .replace(/\\"/g, '"')
        .trim()
      return { narrator, text }
    } catch {
      // Fall through to plain text handling
    }
  }

  // Plain text - try to extract narrator if present
  const narratorMatch = raw.match(/^Narrated\s+([^:]+):\s*(.*)$/s)
  if (narratorMatch) {
    return {
      narrator: narratorMatch[1].trim(),
      text: narratorMatch[2].trim(),
    }
  }

  return { narrator: "", text: raw }
}

/**
 * Returns a clean display string for the english translation.
 * Handles JSON-encoded translations gracefully.
 */
export function getCleanTranslation(raw: string | null | undefined): string {
  const { narrator, text } = parseEnglishTranslation(raw)
  if (narrator && text) {
    return `Narrated ${narrator}: ${text}`
  }
  return text || raw || ""
}

/**
 * Maps collection slug to display name
 */
export function getCollectionDisplayName(slug: string): string {
  const names: Record<string, string> = {
    "sahih-bukhari": "Sahih al-Bukhari",
    "sahih-muslim": "Sahih Muslim",
    "sunan-abu-dawud": "Sunan Abu Dawud",
    "jami-tirmidhi": "Jami at-Tirmidhi",
    "sunan-nasai": "Sunan an-Nasai",
    "sunan-ibn-majah": "Sunan Ibn Majah",
    "muwatta-malik": "Muwatta Malik",
    "musnad-ahmad": "Musnad Ahmad",
  }
  return names[slug] || slug
}
