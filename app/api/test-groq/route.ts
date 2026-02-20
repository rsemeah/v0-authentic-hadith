import { generateText } from "ai"

export async function GET() {
  try {
    const { text } = await generateText({
      model: "groq/llama-3.3-70b-versatile",
      prompt: "Who is Prophet Mohammed? Please provide a brief, respectful summary in 2-3 sentences.",
      maxOutputTokens: 256,
    })

    return Response.json({
      success: true,
      engine: "SilentEngine",
      model: "groq/llama-3.3-70b-versatile",
      response: text,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        hint: "Check that GROQ_API_KEY is set in your environment variables.",
      },
      { status: 500 },
    )
  }
}
