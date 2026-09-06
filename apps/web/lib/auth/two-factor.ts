import { randomBytes } from "node:crypto"
import { generateSecret, generateURI, verify } from "otplib"

const TWO_FACTOR_ISSUER = "Invoice Flow"

export function generateTwoFactorSecret(email: string) {
  const secret = generateSecret()

  const otpauthUrl = generateURI({
    issuer: TWO_FACTOR_ISSUER,
    label: email,
    secret,
  })

  return {
    secret,
    otpauthUrl,
  }
}

export async function verifyTwoFactorToken(
  secret: string,
  token: string,
) {
  const result = await verify({
    secret,
    token,
  })

  return result.valid
}

export function generateRecoveryCodes(count = 8) {
  return Array.from({ length: count }, () => {
    const value = randomBytes(4).toString("hex").toUpperCase()

    return `${value.slice(0, 4)}-${value.slice(4, 8)}`
  })
}