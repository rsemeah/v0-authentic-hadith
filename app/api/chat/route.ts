import { streamText, tool, convertToModelMessages, UIMessage, consumeStream, stepCountIs } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { checkAIQuota, incrementAIUsage } from "@/lib/quotas/check"

export const maxDuration = 30

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are HadithChat, a knowledgeable Islamic scholar assistant specializing in hadith studies.

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

export async function POST(req: Request) {
  // Graceful check for missing GROQ_API_KEY
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
    const { messages }: { messages: UIMessage[] } = await req.json()
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

    console.log("[v0] Chat API: starting streamText with Groq")
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
      abortSignal: req.signal,
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
                return { results: [], error: error.message }
              }

              // Clean up any JSON-encoded translations
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
              return { results: [], error: "Failed to search hadiths" }
            }
          },
        }),
      },
      stopWhen: stepCountIs(3),
    })

    return result.toUIMessageStreamResponse({
      originalMessages: messages,
      onFinish: async () => {
        await incrementAIUsage(user.id)
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[HadithChat] Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process your request. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
