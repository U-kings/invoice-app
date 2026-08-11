import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto" // Note: If this fails on deploy, swap to Web Crypto as shown previously
import { z } from "zod"
import { connectDB } from "@/lib/db" // 1. IMPORT YOUR DATABASE CONNECTION UTILITY
import User from "@/models/User" 

const querySchema = z.object({
  token: z
    .string({ message: "Verification token is required" }) 
    .length(64, "Token must be exactly 64 characters long"), 
})

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // 2. CONNECT TO YOUR DATABASE FIRST
    await connectDB()

    const { searchParams } = new URL(req.url)
    const rawQueryParams = { token: searchParams.get("token") }

    const result = querySchema.safeParse(rawQueryParams)

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid request payload"
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { token } = result.data

    const hashedToken: string = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex")

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() }, 
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification link." },
        { status: 400 }
      )
    }

    // 3. SECURELY PERSIST VIA DIRECT MONGOOSE COMMANDS 
    // (This avoids potential schema validation crashes on user.save())
    await User.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: "", verificationTokenExpires: "" }
      }
    );

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    return NextResponse.redirect(new URL("/login?verified=true", baseUrl))
  } catch (error: unknown) {
    // Check your server terminal window! This prints out the true hidden culprit.
    console.error("Verification Error:", error)
    
    // Temporarily exposing the raw error message to your browser to help you debug instantly
    const errMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: `An unexpected error occurred during verification: ${errMessage}` },
      { status: 500 }
    )
  }
}
