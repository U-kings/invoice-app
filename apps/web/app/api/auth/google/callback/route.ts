import { prisma } from "@repo/db"
import { NextRequest, NextResponse } from "next/server"
import { createSessionAndCookie } from "@/lib/auth/auth" // 🚀 Switch to the unified utility

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const origin = req.nextUrl.origin
    const redirectUri = `${origin}/api/auth/google/callback`

    if (!code) {
      console.error(
        "❌ OAuth Error: No authorization code returned from Google."
      )
      return NextResponse.redirect(new URL("/login?error=no_code", origin))
    }

    const tokenEndpointParts = ["https:", "", "oauth2.googleapis.com", "token"]
    const tokenUrl = tokenEndpointParts.join("/")

    console.log(
      "🔄 Exchanging authorization code for tokens directly server-to-server..."
    )
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    })

    const tokenData = await tokenResponse.json()
    if (!tokenResponse.ok) {
      console.error(
        "❌ Google Token Exchange Failed! Verify your GOOGLE_CLIENT_SECRET setup:",
        tokenData
      )
      return NextResponse.redirect(
        new URL("/login?error=token_exchange_failed", origin)
      )
    }

    const profileEndpointParts = [
      "https:",
      "",
      "www.googleapis.com",
      "oauth2",
      "v3",
      "userinfo",
    ]
    const profileUrl = profileEndpointParts.join("/")

    console.log("🔄 Fetching user profile information from Google...")
    const userProfileResponse = await fetch(profileUrl, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    const profile = await userProfileResponse.json()
    if (!userProfileResponse.ok) {
      console.error("❌ Google Profile Fetch Failed:", profile)
      return NextResponse.redirect(
        new URL("/login?error=profile_fetch_failed", origin)
      )
    }

    const email = profile.email.toLowerCase()
    const googleId = profile.sub
    const firstName = profile.given_name || "First Name"
    const lastName = profile.family_name || "Last Name"

    // 3. Database Sync with Prisma (Including Subscription to map schema context)
    console.log(`🔄 Syncing user in database: ${email}`)
    let user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    })

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, isVerified: true },
          include: { subscription: true },
        })
      }
    } else {
      user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          googleId,
          password: null,
          terms: true,
          isVerified: true,
        },
        include: { subscription: true },
      })
    }

    // 4. Unified Session Lifecycle Execution
    console.log(
      "🚀 User authenticated successfully! Initializing shared session handling..."
    )

    // Create the standard redirect response target
    const successResponse = NextResponse.redirect(new URL("/dashboard", origin))

    // 🚀 CENTRALIZED CORE: Handle database session tracking & secure HTTP-only cookies
    await createSessionAndCookie(req, successResponse, user)

    return successResponse
  } catch (error) {
    console.error(
      "💥 CRITICAL SYSTEM FAULT inside Google Callback Route:",
      error
    )
    return NextResponse.redirect(
      new URL("/login?error=internal_server_error", req.nextUrl.origin)
    )
  }
}
