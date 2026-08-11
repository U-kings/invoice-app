import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { z } from "zod"
import User from "@/models/User" // Ensure your User model uses Mongoose types

// 1. Define a strict schema for incoming URL query parameters
const querySchema = z.object({
  token: z
    .string({ message: "Verification token is required" }) // Replaced required_error with message
    .length(64, "Token must be exactly 64 characters long"), // Changed min/max to a precise .length()
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url)
    const rawQueryParams = { token: searchParams.get("token") }

    // 2. Validate URL search params safely against the schema
    const result = querySchema.safeParse(rawQueryParams)

    if (!result.success) {
      // Use .issues to get the array of errors in Zod
      const firstError =
        result.error.issues[0]?.message || "Invalid request payload"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    // TypeScript now safely infers that `token` is a valid string
    const { token } = result.data

    // 3. Re-hash incoming token safely
    const hashedToken: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    // 4. Find the user with Mongoose type support
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() }, // Type safe Date check
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      )
    }

    // 5. Update, clear data, and persist to DB
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpires = undefined
    await user.save()

    // 6. Type-safe redirect url formulation
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(new URL("/login?verified=true", baseUrl))
  } catch (error: unknown) {
    console.error("Verification Error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during verification" },
      { status: 500 }
    )
  }
}
