import * as crypto from "crypto"

export function safeTimingCheck(
  computedHash: string,
  inboundSignature: string
): boolean {
  const a = Buffer.from(computedHash, "utf8")
  const b = Buffer.from(inboundSignature, "utf8")

  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export async function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
  algorithm: "sha512" | "sha256" = "sha512"
): Promise<boolean> {
  if (!signature || !secret) return false
  const hash = crypto
    .createHmac(algorithm, secret)
    .update(rawBody)
    .digest("hex")
  return safeTimingCheck(hash, signature)
}

export function verifyStripeSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined
): boolean {
  if (!signature || !secret) return false

  const parts = signature.split(",")
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1]
  const v1Signatures = parts
    .filter((p) => p.startsWith("v1="))
    .map((p) => p.split("=")[1])
    .filter((sig): sig is string => typeof sig === "string")

  if (!timestamp || v1Signatures.length === 0) return false

  const signedPayload = `${timestamp}.${rawBody}`
  const computedHash = crypto
    .createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex")

  return v1Signatures.some((v1Sig) => safeTimingCheck(computedHash, v1Sig))
}
