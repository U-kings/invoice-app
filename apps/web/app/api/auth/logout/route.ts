import { NextResponse } from "next/server"

// 1. Define an explicit interface for the JSON response payload
interface LogoutResponseData {
  message: string
}

export async function POST(): Promise<NextResponse<LogoutResponseData>> {
  // 2. Pass the interface as a generic type to NextResponse.json
  const response = NextResponse.json<LogoutResponseData>({
    message: "Logged out successfully",
  })

  // 3. Clear cookie cleanly
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // 🚀 FIXED: Changed from "strict" to "lax" to exactly match the cookie signature set by your Google Callback route
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0, // Explicitly forcing age allocation termination
  })

  return response
}
