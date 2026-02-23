/**
 * SafetyEngine — AI content moderation for discussion posts.
 *
 * Two-layer approach:
 * 1. Fast local keyword/pattern check (TruthSerum-derived)
 * 2. AI review via GPT-4o-mini for anything that passes local check
 *
 * Returns: { approved: boolean, held: boolean, reason?: string }
 */

// ─── Layer 1: Local Pattern Matching (TruthSerum Safety) ──────────────

/** Terms that always trigger an immediate hold for review */
const BLOCKED_PATTERNS: RegExp[] = [
  // Takfir / excommunication
  /\b(kafir|kuffar|mushrik|apostat|murtad)\b/i,
  // Sectarian attacks
  /\b(wahhabi|salafi|sufi|shia|sunni)\b.*\b(wrong|deviant|astray|bidah|heretic|heresy|shirk)\b/i,
  /\b(deviant|heretic|heresy)\b.*\b(sect|group|school|madhab)\b/i,
  // Violence / extremism
  /\b(jihad)\b.*\b(kill|attack|bomb|destroy|fight\s+against)\b/i,
  /\b(kill|murder|behead|execute|slaughter)\b.*\b(infidel|disbeliever|enemy)\b/i,
  // Hate speech
  /\b(hate|destroy|curse)\b.*\b(jews?|christians?|hindus?|atheists?)\b/i,
  // Self-harm
  /\b(suicide|kill\s+myself|end\s+my\s+life|self[- ]harm)\b/i,
  // Spam patterns
  /(?:https?:\/\/\S+){3,}/i, // 3+ URLs in one post
  /(.)\1{10,}/,               // character repetition spam
]

/** Sensitive Islamic topics that need gentle AI review (not blocked, just flagged) */
const SENSITIVE_TOPICS: RegExp[] = [
  /\b(fatwa|halal|haram|permissible|forbidden|ruling)\b/i,
  /\b(shirk|bidah|innovation)\b/i,
  /\b(slavery|concubin|captive|slave)\b/i,
  /\b(wife\s+beat|domestic|strike.*wife|husband.*hit)\b/i,
  /\b(music|singing)\b.*\b(haram|forbidden|sin)\b/i,
  /\b(interest|riba|usury)\b/i,
]

export type ModerationResult = {
  status: "approved" | "held" | "rejected"
  reason: string | null
  flagged_patterns: string[]
}

/**
 * Fast local content check — no API call needed.
 * Returns immediately for clearly safe or clearly blocked content.
 * Returns null if AI review is recommended.
 */
export function localSafetyCheck(content: string): ModerationResult | null {
  const trimmed = content.trim()

  // Too short to be meaningful
  if (trimmed.length < 2) {
    return { status: "rejected", reason: "Content too short", flagged_patterns: [] }
  }

  // Too long (likely spam or copy-paste)
  if (trimmed.length > 2000) {
    return { status: "held", reason: "Content exceeds maximum length", flagged_patterns: [] }
  }

  // Check blocked patterns
  const flagged: string[] = []
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      flagged.push(pattern.source)
    }
  }

  if (flagged.length > 0) {
    return {
      status: "held",
      reason: "Content flagged for review: potentially sensitive language detected",
      flagged_patterns: flagged,
    }
  }

  // Check sensitive topics — these need AI review
  for (const pattern of SENSITIVE_TOPICS) {
    if (pattern.test(trimmed)) {
      return null // signal: needs AI review
    }
  }

  // Clean content under reasonable length — approve locally
  return { status: "approved", reason: null, flagged_patterns: [] }
}

// ─── Layer 2: AI Moderation Review ──────────────

const MODERATION_SYSTEM_PROMPT = `You are a content moderation system for an Islamic hadith study app called "Authentic Hadith".

Users can post discussion comments on individual hadiths to share reflections, ask questions, and learn together.

Your job: evaluate whether a user's post is safe to publish.

APPROVE posts that:
- Share personal reflections or lessons learned from the hadith
- Ask genuine questions about the hadith's meaning, context, or application
- Provide scholarly context (referencing scholars, tafsir, etc.)
- Express gratitude, make dua, or share positive experiences
- Respectfully discuss different scholarly opinions

HOLD (flag for human review) posts that:
- Make declarative fatwa-like rulings (e.g., "this is haram/halal")
- Discuss sensitive fiqh topics (domestic relations, slavery in historical context)
- Contain sectarian language without being explicitly hateful
- Reference controversial contemporary scholars or movements
- Appear to be theological arguments that could escalate

REJECT posts that:
- Contain takfir (declaring other Muslims as disbelievers)
- Include hate speech against any group
- Promote violence or extremism
- Contain self-harm content
- Are spam, advertisements, or off-topic
- Contain personal attacks or harassment

Respond ONLY with valid JSON:
{"status": "approved" | "held" | "rejected", "reason": "brief explanation or null"}`

/**
 * AI-powered content moderation using GPT-4o-mini.
 * Called when local check can't make a confident decision.
 */
export async function aiModerationCheck(content: string): Promise<ModerationResult> {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      // If no API key, fall back to approving (local check already passed)
      console.warn("[SafetyEngine] No OPENAI_API_KEY — skipping AI moderation")
      return { status: "approved", reason: null, flagged_patterns: [] }
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: MODERATION_SYSTEM_PROMPT },
          { role: "user", content: `Evaluate this discussion post:\n\n"${content}"` },
        ],
        temperature: 0,
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      console.error("[SafetyEngine] OpenAI API error:", response.status)
      // On API failure, approve (local check already passed)
      return { status: "approved", reason: null, flagged_patterns: [] }
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content?.trim() || ""

    // Parse AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        status: parsed.status === "held" ? "held" : parsed.status === "rejected" ? "rejected" : "approved",
        reason: parsed.reason || null,
        flagged_patterns: ["ai_review"],
      }
    }

    // Couldn't parse — approve
    return { status: "approved", reason: null, flagged_patterns: [] }
  } catch (err) {
    console.error("[SafetyEngine] AI moderation failed:", err)
    return { status: "approved", reason: null, flagged_patterns: [] }
  }
}

/**
 * Full moderation pipeline: local check → AI review if needed.
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  // Layer 1: fast local check
  const localResult = localSafetyCheck(content)
  if (localResult !== null) {
    return localResult
  }

  // Layer 2: AI review for sensitive/ambiguous content
  return aiModerationCheck(content)
}
