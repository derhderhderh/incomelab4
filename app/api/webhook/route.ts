import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

const adminDb = getFirestore()

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get("stripe-signature")!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const { courseId, userId } = session.metadata!

    try {
      // Add purchase record
      await adminDb.collection("purchases").add({
        userId,
        courseId,
        stripeSessionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : 0,
        timestamp: new Date(),
      })

      // Update user's purchased courses
      await adminDb
        .collection("users")
        .doc(userId)
        .update({
          purchasedCourses: FieldValue.arrayUnion(courseId),
        })

      console.log(`Successfully processed purchase for user ${userId}, course ${courseId}`)
    } catch (error) {
      console.error("Error processing purchase:", error)
      return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
