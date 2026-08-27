import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // 1. Extract the secure authentication cookie token
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error("JWT_SECRET is missing.");

    // 2. Decode the token payload
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // 3. Query the user record context matching your PostgreSQL id
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Strip password safely before sending profile downstream
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...publicUser } = user;

    return NextResponse.json({ 
      user: publicUser, 
      access_token: token 
    }, { status: 200 });

  } catch (error) {
    console.error("Session verification route failure:", error);
    return NextResponse.json({ error: "Invalid session token" }, { status: 401 });
  }
}
