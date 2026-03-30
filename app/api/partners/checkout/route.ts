import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!)
}

const PLANS: Record<string, { name: string; amount: number; description: string }> = {
  continuity: {
    name: "Continuity Lane",
    amount: 199500,
    description: "Lower throughput — maintenance, fixes, support, and incremental improvements.",
  },
  core: {
    name: "Core Lane",
    amount: 499500,
    description: "One active task at a time — steady product work, automation, and feature delivery.",
  },
  priority: {
    name: "Priority Lane",
    amount: 799500,
    description: "Two active tasks at a time — heavier throughput for multiple concurrent priorities.",
  },
}

export async function POST(request: NextRequest) {
  try {
    const { plan } = await request.json()

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const { name, amount, description } = PLANS[plan]
    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_BASE_URL ??
      "http://localhost:3000"

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: amount,
            product_data: {
              name,
              description,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { plan },
      subscription_data: {
        metadata: { plan },
      },
      success_url: `${origin}/partners?subscribed=${plan}`,
      cancel_url: `${origin}/partners#pricing`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Partners checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
