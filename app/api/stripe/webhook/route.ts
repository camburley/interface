import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getFirebaseAdmin } from "@/lib/firebase-admin"
import { sendWelcomeEmail } from "@/lib/email"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })
}

const TIER_LABELS: Record<string, string> = {
  continuity: "Continuity",
  core: "Core",
  priority: "Priority",
}

const TIER_PRICES: Record<string, string> = {
  continuity: "$1,995",
  core: "$4,995",
  priority: "$7,995",
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

  const { db } = getFirebaseAdmin()

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === "subscription") {
      await handleSubscriptionCheckout(db, stripe, session)
    } else {
      await handleRetainerTopUp(db, session)
    }
  }

  return NextResponse.json({ received: true })
}

async function handleSubscriptionCheckout(
  db: FirebaseFirestore.Firestore,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const plan = session.metadata?.plan
  const email = session.customer_details?.email
  const name = session.customer_details?.name
  const customerId = session.customer as string | undefined

  if (!email || !plan) {
    console.error("[webhook] Subscription checkout missing email or plan metadata")
    return
  }

  const tierLabel = TIER_LABELS[plan] ?? plan
  const tierPrice = TIER_PRICES[plan] ?? "$0"

  const clientsSnap = await db
    .collection("clients")
    .where("email", "==", email)
    .limit(1)
    .get()

  if (!clientsSnap.empty) {
    const clientDoc = clientsSnap.docs[0]
    const updates: Record<string, unknown> = {
      clientType: "subscription",
      subscriptionTier: plan,
    }
    if (customerId) updates.stripeCustomerId = customerId
    await clientDoc.ref.update(updates)

    const clientName = clientDoc.data().name ?? name ?? email.split("@")[0]
    await sendWelcomeEmail(email, clientName, tierLabel, tierPrice)
    console.log(`[webhook] Welcome email sent to ${email} (${tierLabel})`)
  } else {
    console.log(`[webhook] No client doc found for ${email}, sending welcome email anyway`)
    await sendWelcomeEmail(email, name ?? email.split("@")[0], tierLabel, tierPrice)
  }
}

async function handleRetainerTopUp(
  db: FirebaseFirestore.Firestore,
  session: Stripe.Checkout.Session,
) {
  const clientId = session.metadata?.clientId
  const amount = Number(session.metadata?.amount ?? 0)

  if (!clientId || !amount) {
    console.error("[webhook] Retainer top-up missing clientId or amount")
    return
  }

  const clientRef = db.collection("clients").doc(clientId)
  await db.runTransaction(async (tx) => {
    const doc = await tx.get(clientRef)
    const current = doc.data()?.balance ?? 0
    tx.update(clientRef, { balance: current + amount })
  })

  const paymentsSnap = await db
    .collection("retainer_payments")
    .where("stripeSessionId", "==", session.id)
    .limit(1)
    .get()

  if (!paymentsSnap.empty) {
    await paymentsSnap.docs[0].ref.update({ status: "completed" })
  }
}
