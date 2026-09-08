import { prisma } from "@repo/db";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import { createSessionAndCookie } from "@/lib/auth/auth"; // 🚀 Switch to the unified utility

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(req: NextRequest) {
  try {
    const { idToken, terms } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Google ID Token is required." }, { status: 400 });
    }

    // 1. Verify token authenticity directly with Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json({ error: "Invalid token payload." }, { status: 400 });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub; 
    const firstName = payload.given_name || "First Name";
    const lastName = payload.family_name || "Last Name";

    // 2. Query matching user account context
    let user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true }, 
    });

    if (user) {
      // SCENARIO A: Link Google ID if missing.
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, isVerified: true },
          include: { subscription: true },
        });
      }
      
      const subscriptionStatus = user.subscription?.status || "EXPIRED";
      const subscriptionPlan = user.subscription?.plan || "FREE";
      
      const response = NextResponse.json({
        message: "Login successful!",
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName,
          subscriptionStatus,
          subscriptionPlan,
        }
      }, { status: 200 });

      // 🚀 CENTRALIZED CORE: Handle database session tracking & secure HTTP-only cookies
      const { token } = await createSessionAndCookie(req, response, user);

      // Re-inject token keys into payload body to support client-side architecture requirements
      const body = await response.json();
      body.token = token;
      body.access_token = token;

      return NextResponse.json(body, { status: 200, headers: response.headers });
    }

    // SCENARIO B: Brand new registration via Google
    if (!terms) {
      return NextResponse.json({ error: "You must accept the terms and conditions." }, { status: 400 });
    }

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
    });

    const subscriptionStatus = user.subscription?.status || "EXPIRED";
    const subscriptionPlan = user.subscription?.plan || "FREE";

    const response = NextResponse.json({
      message: "Registration profile created successfully via Google!",
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName,
        subscriptionStatus,
        subscriptionPlan,
      }
    }, { status: 201 });

    // 🚀 CENTRALIZED CORE: Handle database session tracking & secure HTTP-only cookies for sign-up path
    const { token } = await createSessionAndCookie(req, response, user);

    const body = await response.json();
    body.token = token;
    body.access_token = token;

    return NextResponse.json(body, { status: 201, headers: response.headers });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Auth Error";
    console.error("Google Auth lifecycle failure:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
