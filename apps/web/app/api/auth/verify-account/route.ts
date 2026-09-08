import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import { getAuthenticatedSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the session exactly like your template
    const auth = await getAuthenticatedSession(request)

    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: auth.userId,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    // 2. Parse the body containing accountNumber and bankCode from the frontend
    const body = await request.json()
    const { accountNumber, bankCode } = body

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { error: "Account number and bank code are required" },
        { status: 400 }
      )
    }

    // 3. Request Paystack's API to resolve the bank details
    const paystackUrl = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`

    const paystackResponse = await fetch(paystackUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await paystackResponse.json()

    // 4. Handle Paystack's structural responses
    if (!paystackResponse.ok || data.status !== true) {
      return NextResponse.json(
        { error: data.message || "Could not resolve account details" },
        { status: paystackResponse.status || 400 }
      )
    }

    // 5. Return success and the resolved name to the frontend
    return NextResponse.json(
      {
        success: true,
        accountName: data.data.account_name,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Account verification route failure:", error)
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    )
  }
}

// ADD THIS GET METHOD TO FETCH BANKS DYNAMICALLY
export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate the session exactly like your template
    const auth = await getAuthenticatedSession(request)
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // 2. Fetch the dynamic list from Paystack's Miscellaneous API
    const paystackUrl = "https://api.paystack.co/bank"
    const response = await fetch(paystackUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
      // Optional cache configuration (Banks rarely change, so cache for 24 hours)
      next: { revalidate: 86400 },
    })

    const data = await response.json()

    if (!response.ok || data.status !== true) {
      return NextResponse.json(
        { error: data.message || "Failed to load banks" },
        { status: response.status || 400 }
      )
    }

    // 3. Return the array of clean objects containing name and code
    return NextResponse.json({
      success: true,
      banks: data.data.map((bank: any) => ({
        name: bank.name,
        code: bank.code,
      })),
    })
  } catch (error) {
    console.error("Fetch banks route failure:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
