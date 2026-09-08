import { jwtVerify, JWTPayload } from "jose"

// Define the your exact database subscription enum type structure
export type SubscriptionStatusType =
  "ACTIVE" | "TRIALING" | "PENDING" | "PAST_DUE" | "CANCELLED" | "EXPIRED"
export type subscriptionPlanType = "FREE" | "PRO"

// ✨ Update this interface to reflect what your login route actually signs
export interface AuthUserPayload extends JWTPayload {
  userId: string // 🚀 Changed from 'id' to 'userId' to match jwt.sign
  role?: string
  class?: string // Added to match jwt.sign payload
  sessionId: string // Added to match jwt.sign payload
  subscriptionStatus: SubscriptionStatusType // ✨ Strictly typed status key for your Edge Middleware
  subscriptionPlan: subscriptionPlanType
}

/**
 * Validates a JWT string token safely on Next.js Edge Middleware runtime.
 */
export async function verifyAuthToken(
  token: string | undefined
): Promise<AuthUserPayload | null> {
  if (!token) return null

  try {
    const secretKey = process.env.JWT_SECRET
    if (!secretKey) {
      console.error("Missing JWT_SECRET environment variable.")
      return null
    }

    const secret = new TextEncoder().encode(secretKey)
    const { payload } = await jwtVerify(token, secret)

    // Typecast the generic JWTPayload to your strict AuthUserPayload interface
    return payload as AuthUserPayload
  } catch (error) {
    // Gracefully handle expired, structural, or invalid signatures without crashing
    return null
  }
}
