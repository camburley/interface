import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { getSessionUser } from "@/lib/session"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })
}

const RETAINER_AMOUNT_CENTS = 100000 // $1,000

export async function POST(request: NextRequest) {
  const user = await getSessionUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(user.uid).get()
  if (!clientDoc.exists) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 })
  }

  const clientData = clientDoc.data()!
  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"

  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: RETAINER_AMOUNT_CENTS,
          product_data: {
            name: "Retainer Top-Up",
            description: `Development retainer — ${clientData.projectName}`,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: user.email,
    metadata: {
      clientId: user.uid,
      amount: String(RETAINER_AMOUNT_CENTS / 100),
    },
    success_url: `${origin}/client/dashboard?funded=true`,
    cancel_url: `${origin}/client/dashboard`,
  })

  // Store pending payment record
  await db.collection("retainer_payments").add({
    clientId: user.uid,
    amount: RETAINER_AMOUNT_CENTS / 100,
    stripeSessionId: session.id,
    status: "pending",
    createdAt: new Date().toISOString(),
  })

  return NextResponse.json({ url: session.url })
}
