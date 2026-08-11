import { NextResponse } from "next/server";

// 1. Define an explicit interface for the JSON response payload
interface LogoutResponseData {
  message: string;
}

export async function POST(): Promise<NextResponse<LogoutResponseData>> {
  // 2. Pass the interface as a generic type to NextResponse.json
  const response = NextResponse.json<LogoutResponseData>({
    message: "Logged out successfully",
  });

  // 3. Clear cookie (Next.js implicitly types the options argument as Partial<ResponseCookie>)
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Enforce HTTPS in production
    sameSite: "strict", // Protect against CSRF attacks
    path: "/",
    expires: new Date(0), // Instantly expires the cookie
  });

  return response;
}
