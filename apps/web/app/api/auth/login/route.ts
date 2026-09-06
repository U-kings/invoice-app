import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password: inputPassword } = await req.json()

    // 1. Validate input
    if (!email || !inputPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      )
    }

    // 3. Google-only account check
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "This account uses Google Sign-In. Please click 'Continue with Google'.",
        },
        { status: 400 },
      )
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(
      inputPassword,
      user.password,
    )

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      )
    }

    // 5. Verify account
    if (!user.isVerified) {
      return NextResponse.json(
        {
          error:
            "Your account is not verified yet. Please check your email to verify your account.",
          requiresVerification: true,
        },
        { status: 403 },
      )
    }

    // 6. Verify JWT secret
    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      throw new Error(
        "JWT_SECRET environment variable is missing from configuration.",
      )
    }

    // 7. Create persistent session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tokenId: crypto.randomUUID(),
        userAgent: req.headers.get("user-agent"),
        ipAddress:
          req.headers
            .get("x-forwarded-for")
            ?.split(",")[0]
            ?.trim() ??
          req.headers.get("x-real-ip"),
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
    })

    // 8. Create JWT containing the session ID
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        class: user.class,
        sessionId: session.id,
      },
      jwtSecret,
      {
        expiresIn: "7d",
      },
    )

    // 9. Remove password before returning user
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user

    // 10. Create response
    const response = NextResponse.json({
      message: "Login successful",
      user: publicUser,
      access_token: token,
    })

    // 11. Store JWT in HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (err: unknown) {
    console.error("Login Route Error:", err)

    const errorMessage =
      err instanceof Error
        ? err.message
        : "An unexpected server error occurred"

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    )
  }
}