import { prisma } from "@repo/db";
import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function generateAccessToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is missing from the server.");
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

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
    });

    if (user) {
      // SCENARIO A: Link Google ID if missing.
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { email },
          data: { googleId, isVerified: true }, 
        });
      }
      
      const accessToken = generateAccessToken(user.id);
      
      // 🚀 FIX: Return BOTH token names to support all frontend variants
      const response = NextResponse.json({
        message: "Login successful!",
        token: accessToken,        // 💡 Support generic token property
        access_token: accessToken, // 💡 Support snake_case access_token
        user: { 
          id: user.id, 
          email: user.email, 
          firstName: user.firstName, 
          lastName: user.lastName 
        }
      }, { status: 200 });

      // 🚀 NEXT.JS COOKIE FALLBACK: If your middleware guards /dashboard, it needs this cookie!
      response.cookies.set("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      });

      return response;
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
    });

    const accessToken = generateAccessToken(user.id);

    const response = NextResponse.json({
      message: "Registration profile created successfully via Google!",
      token: accessToken,
      access_token: accessToken,
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.firstName, 
        lastName: user.lastName 
      }
    }, { status: 201 });

    // Set cookie for brand new signups as well
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Internal Auth Error";
    console.error("Google Auth lifecycle failure:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
