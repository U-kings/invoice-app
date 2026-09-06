import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "./lib/auth"

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get("token")?.value
  const tempToken = request.cookies.get("temp_token")?.value // 🌟 1. Check for the temporary 2FA token

  const verifiedToken = await verifyAuthToken(token)
  const { pathname } = request.nextUrl

  // Define routes that should NOT be accessible to fully logged-in users
  const isAuthPage = pathname === "/login" || pathname === "/api/auth/login"

  if (isAuthPage) {
    // 🌟 2. If they have a temporary token, they are completing 2FA. Let them stay on the login page!
    if (tempToken && !verifiedToken) {
      return NextResponse.next()
    }

    // If they are fully logged in and trying to access login page -> Send to dashboard
    if (verifiedToken) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // If they are not logged in at all, let them access the login page
    return NextResponse.next()
  }

  // Guarding Dashboard Routes: If no valid full token, boot them to login
  if (!verifiedToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname) // Remembers where they wanted to go
    return NextResponse.redirect(loginUrl)
  }

  // Token is verified and they are trying to access a dashboard route -> Proceed
  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/api/auth/login", "/dashboard/:path*"],
}
