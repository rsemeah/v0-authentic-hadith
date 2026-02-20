import { streamText, tool, convertToModelMessages, UIMessage } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkAIQuota, incrementAIUsage } from "@/lib/quotas/check"

export const maxDuration = 30

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const BASE_SYSTEM_PROMPT = `You are HadithChat, a knowledgeable Islamic scholar assistant specializing in hadith studies.

Your role:
1. Help users understand the meanings and context of hadiths
2. Explain the chain of narration (isnad) and authenticity grades
3. Provide scholarly interpretations from classical and contemporary scholars
4. Compare similar hadiths across different collections
5. Answer questions about Islamic teachings based on authentic sources

Guidelines:
- Always cite your sources when referencing specific hadiths
- Be respectful and educational in your responses
- Acknowledge when there are scholarly differences of opinion
- Use clear, accessible language while maintaining scholarly accuracy
- When discussing hadith authenticity, reference the grading (Sahih, Hasan)
- You only answer using authenticated hadith. If none are found, say so honestly.
- When you search for hadiths, present the results in a clean readable format with the narrator, translation text, collection name, and grade.

Critical content safety rules (you MUST follow these):
- You are NOT a mufti. NEVER issue fatwas or definitive religious rulings. Always say "scholars have said..." or "according to [scholar/school]..." and recommend users consult a qualified local scholar for personal rulings.
- NEVER provide medical, legal, financial, or psychological advice. If a user asks about health, mental health, or legal matters, direct them to qualified professionals.
- NEVER encourage self-harm, violence, extremism, or hatred toward any group. If a user expresses distress, gently encourage them to seek help from a qualified counselor or call a crisis helpline.
- If a hadith involves sensitive topics (slavery, warfare, gender), provide full historical context and note how classical scholars understood the text within its time period.
- NEVER claim to represent any specific school of thought (madhab) as the only correct interpretation.
- Stay within the domain of hadith scholarship. Politely decline questions unrelated to Islamic knowledge.

You have access to a database of 31,839 authenticated hadiths from: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah, Muwatta Malik, and Musnad Ahmad.

Use the searchHadiths tool to find relevant hadiths before answering questions.`

const MADHAB_PROMPT_SECTION = (madhab: string) =>
  `\n\nUser's School of Thought: ${madhab}
When the user's question involves a fiqh ruling where the four schools of thought differ:
1. Present the positions of all relevant schools briefly.
2. Then clarify which position the ${madhab} school holds.
3. Never dismiss other schools or imply one is more correct than another.
4. Only reference the user's madhab when there is a genuine difference of opinion -- do not mention it when scholars are unanimous.
5. Always recommend consulting a qualified local scholar for personal rulings.`

const LEVEL_PROMPT_SECTIONS: Record<string, string> = {
  beginner: `\n\nUser's Learning Level: Beginner
Adapt your responses for someone new to Islamic studies:
- Use short, clear sentences. Avoid jargon.
- Define any Arabic term the first time you use it (e.g. "isnad (chain of narration)").
- Focus on practical application and spiritual benefit.
- Do not assume prior knowledge of fiqh, usul, or hadith sciences.
- Keep explanations warm, encouraging, and concise.`,

  intermediate: `\n\nUser's Learning Level: Intermediate
Adapt your responses for a practicing Muslim with foundational knowledge:
- You may use common Arabic terminology with brief definitions.
- You can mention scholarly disagreements and different opinions.
- Reference classical scholars when relevant (e.g. Imam al-Nawawi, Ibn Hajar).
- Provide moderate depth -- explain reasoning behind rulings, not just conclusions.
- Balance accessibility with scholarly rigor.`,

  advanced: `\n\nUser's Learning Level: Advanced
Adapt your responses for a student of knowledge:
- Use Arabic terminology freely; no need to define well-known terms.
- Cite specific scholars, books, and chains of narration when relevant.
- Discuss minority vs. majority scholarly opinions with nuance.
- Reference classical works (Fath al-Bari, Sharh Muslim, al-Mughni, etc.).
- Provide structured academic analysis. Do not oversimplify.`,
}

function buildSystemPrompt(madhab?: string | null, level?: string | null): string {
  let prompt = BASE_SYSTEM_PROMPT

  if (madhab && madhab !== "Other / Prefer not to say") {
    prompt += MADHAB_PROMPT_SECTION(madhab)
  }

  const normalizedLevel = (level || "intermediate").toLowerCase()
  if (LEVEL_PROMPT_SECTIONS[normalizedLevel]) {
    prompt += LEVEL_PROMPT_SECTIONS[normalizedLevel]
  }

  return prompt
}

export async function POST(req: Request) {
  if (!process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({
        error: "AI service is not configured. Please set the GROQ_API_KEY environment variable.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    )
  }

  try {
    console.log("[v0] Chat API: POST received")
    const body = await req.json()
    const messages: UIMessage[] = body.messages
    console.log("[v0] Chat API: messages count:", messages?.length)

    // Auth check
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("[v0] Chat API: user:", user?.id ?? "NONE")
    if (!user) {
      return new Response(
        JSON.stringify({ error: "You must be logged in to use the AI assistant." }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      )
    }

    // Quota check
    console.log("[v0] Chat API: checking quota for user", user.id)
    const quotaCheck = await checkAIQuota(user.id)
    console.log("[v0] Chat API: quota result:", JSON.stringify(quotaCheck))

    if (!quotaCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: "quota_exceeded",
          message: `Daily limit reached. ${quotaCheck.tier === "free" ? "Explorer accounts include 3 AI explanations per day. Upgrade to Pro for unlimited access." : quotaCheck.reason}`,
          quota: {
            daily_remaining: quotaCheck.daily_remaining,
            monthly_remaining: quotaCheck.monthly_remaining,
            daily_limit: quotaCheck.daily_limit,
            monthly_limit: quotaCheck.monthly_limit,
            tier: quotaCheck.tier,
          },
          upgrade_url: "/pricing",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      )
    }

    // Fetch user preferences for personalized system prompt
    const [{ data: prefs }, { data: profile }] = await Promise.all([
      supabase
        .from("user_preferences")
        .select("learning_level")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("profiles")
        .select("school_of_thought")
        .eq("user_id", user.id)
        .single(),
    ])

    const systemPrompt = buildSystemPrompt(
      profile?.school_of_thought,
      prefs?.learning_level,
    )

    console.log("[v0] Chat API: converting messages")
    const convertedMessages = await convertToModelMessages(messages)
    console.log("[v0] Chat API: converted, starting streamText with Groq")

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: convertedMessages,
      tools: {
        searchHadiths: tool({
          description:
            "Search the hadith database for relevant narrations by keyword. Use this when the user asks about a topic, narrator, or specific hadith.",
          inputSchema: z.object({
            query: z.string().describe("The search term to find relevant hadiths"),
            limit: z.number().nullable().describe("Max results to return, defaults to 5"),
          }),
          execute: async ({ query, limit }) => {
            try {
              console.log("[v0] Tool searchHadiths called with:", query)
              const supabase = await getSupabaseServerClient()
              const { data, error } = await supabase
                .from("hadiths")
                .select(
                  "id, hadith_number, collection, arabic_text, english_translation, narrator, grade, reference",
                )
                .or(
                  `english_translation.ilike.%${query}%,narrator.ilike.%${query}%,arabic_text.ilike.%${query}%`,
                )
                .limit(limit ?? 5)

              if (error) {
                console.log("[v0] Tool searchHadiths error:", error.message)
                return { results: [], error: error.message }
              }

              console.log("[v0] Tool searchHadiths found:", data?.length, "results")

              const cleaned = (data || []).map((h) => {
                let text = h.english_translation || ""
                let narrator = h.narrator || ""
                if (text.startsWith("{") && text.includes('"text"')) {
                  try {
                    const parsed = JSON.parse(text)
                    text = parsed.text || text
                    if (!narrator && parsed.narrator) narrator = parsed.narrator
                  } catch {
                    // keep original
                  }
                }
                return { ...h, english_translation: text, narrator }
              })

              return { results: cleaned }
            } catch (toolError) {
              console.error("[v0] Tool searchHadiths exception:", toolError)
              return { results: [], error: "Failed to search hadiths" }
            }
          },
        }),
      },
      maxSteps: 3,
    })

    // Increment usage after streaming completes
    incrementAIUsage(user.id).catch((err) =>
      console.error("[v0] Failed to increment usage:", err),
    )

    console.log("[v0] Chat API: returning stream response")
    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process your request. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
