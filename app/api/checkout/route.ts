import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getCourse } from "@/lib/courses"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
})

export async function POST(request: NextRequest) {
  try {
    const { courseId, userId, userEmail } = await request.json()

    if (!courseId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const course = await getCourse(courseId)
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description: course.description,
            },
            unit_amount: course.price * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&courseId=${courseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/course/${courseId}?canceled=true`,
      customer_email: userEmail,
      metadata: {
        courseId,
        userId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
