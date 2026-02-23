import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  const stripe = getStripe()
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const clientId = session.metadata?.clientId
    const amount = Number(session.metadata?.amount ?? 0)

    if (!clientId || !amount) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 })
    }

    const { db } = getFirebaseAdmin()

    // Increment client balance
    const clientRef = db.collection("clients").doc(clientId)
    await db.runTransaction(async (tx) => {
      const doc = await tx.get(clientRef)
      const current = doc.data()?.balance ?? 0
      tx.update(clientRef, { balance: current + amount })
    })

    // Update payment record to completed
    const paymentsSnap = await db
      .collection("retainer_payments")
      .where("stripeSessionId", "==", session.id)
      .limit(1)
      .get()

    if (!paymentsSnap.empty) {
      await paymentsSnap.docs[0].ref.update({ status: "completed" })
    }
  }

  return NextResponse.json({ received: true })
}
