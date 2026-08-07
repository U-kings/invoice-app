import { NextResponse } from "next/server"
import { connectDB } from "@/lib/db"

import { getCurrentUser } from "@/lib/getCurrentUser"

export async function POST(req) {
  try {
    await connectDB()

    const { amount, items, breakdown, method } = await req.json()

    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: amount * 100,

          metadata: {
            userId: user._id.toString(),
            items: breakdown,
            method,
          },

          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/success`,
        }),
      }
    )

    const data = await response.json()

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Unable to initialize payment" },
      { status: 500 }
    )
  }
}
