import { streamText, tool } from "ai"
import { createGroq } from "@ai-sdk/groq"
import { z } from "zod"
import { getSupabaseServerClient } from "@/lib/supabase/server"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

const SYSTEM_PROMPT = `You are TruthSerum, a knowledgeable Islamic scholar assistant specializing in hadith studies.

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

You have access to a database of 31,839 authenticated hadiths from: Sahih al-Bukhari, Sahih Muslim, Sunan Abu Dawud, Jami at-Tirmidhi, Sunan an-Nasai, Sunan Ibn Majah, Muwatta Malik, and Musnad Ahmad.

Use the searchHadiths tool to find relevant hadiths before answering questions.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: SYSTEM_PROMPT,
      messages,
      tools: {
        searchHadiths: tool({
          description:
            "Search the hadith database for relevant narrations by keyword. Use this when the user asks about a topic, narrator, or specific hadith.",
          parameters: z.object({
            query: z.string().describe("The search term to find relevant hadiths"),
            limit: z.number().optional().default(5).describe("Max number of results"),
          }),
          execute: async ({ query, limit }) => {
            const supabase = await getSupabaseServerClient()
            const { data, error } = await supabase
              .from("hadiths")
              .select(
                "id, hadith_number, collection, arabic_text, english_translation, narrator, grade, reference",
              )
              .or(
                `english_translation.ilike.%${query}%,narrator.ilike.%${query}%,arabic_text.ilike.%${query}%`,
              )
              .limit(limit || 5)

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
          },
        }),
      },
      maxSteps: 3,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("[TruthSerum] Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process your request. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
