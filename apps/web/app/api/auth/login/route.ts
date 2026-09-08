import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@repo/db"
import bcrypt from "bcryptjs"
import { createSessionAndCookie } from "@/lib/auth/auth" // 🚀 Updated to look at the combined utility

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password: inputPassword } = await req.json()

    // 1. Validate input
    if (!email || !inputPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // 2. Find user
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase().trim(),
      },
      include: { subscription: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
      )
    }

    // 3. Google-only account check
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "This account uses Google Sign-In. Please click 'Continue with Google'.",
        },
        { status: 400 }
      )
    }

    // 4. Verify password
    const isMatch = await bcrypt.compare(inputPassword, user.password)

    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 }
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
        { status: 403 }
      )
    }

    const subscriptionStatus = user.subscription?.status || "EXPIRED"
    const subscriptionPlan = user.subscription?.plan || "FREE"

    // 6. Remove password before returning user data profile
    const { password, subscription, ...userWithoutPassword } = user

    const publicUser = {
      ...userWithoutPassword,
      subscriptionStatus, 
      subscriptionPlan,
    }

    // 7. Initialize Next.js response target
    const response = NextResponse.json({
      message: "Login successful",
      user: publicUser,
      // Note: If your frontend reads access_token directly from the JSON body stream, 
      // we extract it below in Step 8 to attach it cleanly.
    })

    // 8. 🚀 CENTRALIZED CORE: Handle database session tracking & secure HTTP-only cookies
    const { token } = await createSessionAndCookie(req, response, user)

    // Optional: Re-inject token into payload body if your client-side architecture explicitly depends on it
    const body = await response.json();
    body.access_token = token;
    
    return NextResponse.json(body, { status: 200, headers: response.headers })

  } catch (err: unknown) {
    console.error("Login Route Error:", err)

    const errorMessage =
      err instanceof Error ? err.message : "An unexpected server error occurred"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
