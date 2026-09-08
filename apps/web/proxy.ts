// proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyAuthToken } from "./lib/auth"

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get("token")?.value
  const tempToken = request.cookies.get("temp_token")?.value

  const verifiedToken = await verifyAuthToken(token)
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === "/login" || pathname === "/api/auth/login"

  if (isAuthPage) {
    if (tempToken && !verifiedToken) return NextResponse.next()
    if (verifiedToken)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    return NextResponse.next()
  }

  // Guarding Dashboard Routes: If no valid token, boot to login
  if (!verifiedToken) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ---------------------------------------------------------
  // 📈 SUBSCRIPTION GUARD: PRO / REPORTS CHECK
  // ---------------------------------------------------------

  // Target your reports route specifically
  const isPremiumRoute =
    pathname.startsWith("/dashboard/reports") ||
    pathname.startsWith("/dashboard/payments")

  if (isPremiumRoute) {
    // Extract the status string passed from your login JWT payload
    const subStatus = verifiedToken.subscriptionStatus
    const subPlan = verifiedToken.subscriptionPlan

    // Allow access only if they are actively paying or on a free trial
    const hasProAccess =
      (subStatus === "ACTIVE" || subStatus === "TRIALING") && subPlan === "PRO"

    if (!hasProAccess) {
      // Redirect users who are PENDING, PAST_DUE, or EXPIRED to the upgrade page
      const upgradeUrl = new URL("/dashboard/billing", request.url)
      // const upgradeUrl = new URL("/dashboard/billing/upgrade", request.url)
      // upgradeUrl.searchParams.set("reason", "premium_reports_locked")
      upgradeUrl.searchParams.set("reason", "premium_features_locked")
      return NextResponse.redirect(upgradeUrl)
    }
  }

  return NextResponse.next()
}

// ⚠️ Make sure your matcher includes the reports path pattern
export const config = {
  matcher: [
    "/login",
    "/api/auth/login",
    "/dashboard/:path*", // This covers /dashboard/reports and sub-routes natively
  ],
}
