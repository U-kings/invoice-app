import { connectDB } from "@/lib/db"
import { sendVerificationEmail } from "@/lib/email"
import User from "@/models/User"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    await connectDB()

    const {
      firstName,
      middleName,
      lastName,
      class: userClass,
      email,
      phone,
      password,
      confirmPassword,
      terms,
    } = await req.json()

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 })
    }

    // 2. Block registration if terms are not accepted
    if (!terms || terms === "false") {
      return new Response(
        JSON.stringify({ error: "You must accept the terms and conditions." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    if (password !== confirmPassword) {
      return new Response(
        JSON.stringify({ error: "Passwords do not match." }),
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // Inside your registration route payload destructuring...
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpires = Date.now() + 3600000 // 1 hour from now

    // Hash the token before saving it to the DB for extra security
    const hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex")

    const user = await User.create({
      firstName,
      middleName,
      lastName,
      class: userClass,
      email,
      phone,
      password: hashedPassword,
      terms,
      verificationToken: hashedToken,
      verificationTokenExpires,
    })
    console.log("Created user:", user)

    // Construct your verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/verify-email?token=${verificationToken}`

    // Send the email (pseudo-function for your email service provider)
    await sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      verificationUrl: verificationUrl, // Pass as an object property
    })

    return NextResponse.json(
      {
        message:
          "Registration successful! Please check your email to verify your account.",
      },
      { status: 201 }
    )
    // return Response.json({
    //   message: "User created successfully!",
    //   user,
    // })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Error"

    // Cast err as Error or an object to safely read its parameters
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Failed to send email catch-block:", errorMessage)

    return NextResponse.json({
      success: false,
      error: errorMessage,
    })
  }
}
