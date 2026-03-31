import { NextResponse } from "next/server"
import Stripe from "stripe"
import { getSessionUser } from "@/lib/session"
import { getFirebaseAdmin } from "@/lib/firebase-admin"

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" })
}

const TIER_LABELS: Record<string, string> = {
  continuity: "Continuity",
  core: "Core",
  priority: "Priority",
}

export async function GET() {
  const user = await getSessionUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })

  const { db } = getFirebaseAdmin()
  const clientDoc = await db.collection("clients").doc(user.uid).get()
  if (!clientDoc.exists)
    return NextResponse.json({ error: "Client not found" }, { status: 404 })

  const data = clientDoc.data()!
  const stripeCustomerId = data.stripeCustomerId as string | undefined
  if (!stripeCustomerId)
    return NextResponse.json({ error: "No subscription linked" }, { status: 404 })

  const stripe = getStripe()

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    status: "all",
    limit: 1,
  })

  if (subscriptions.data.length === 0) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 })
  }

  const sub = subscriptions.data[0]
  const price = sub.items.data[0]?.price
  const tier = (data.subscriptionTier as string) ?? "core"

  return NextResponse.json({
    subscription: {
      id: sub.id,
      status: sub.status,
      tierKey: tier,
      tierLabel: TIER_LABELS[tier] ?? tier,
      amountCents: price?.unit_amount ?? 0,
      interval: price?.recurring?.interval ?? "month",
      currentPeriodStart: sub.current_period_start,
      currentPeriodEnd: sub.current_period_end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      created: sub.created,
    },
  })
}
