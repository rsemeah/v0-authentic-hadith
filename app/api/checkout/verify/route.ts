import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"

/**
 * GET /api/checkout/verify?session_id=cs_xxx
 * Verifies a Stripe checkout session is actually complete.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id")

  if (!sessionId) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return NextResponse.json({
      status: session.status,
      payment_status: session.payment_status,
      customer_email: session.customer_details?.email,
    })
  } catch {
    return NextResponse.json({ error: "Invalid session" }, { status: 404 })
  }
}
