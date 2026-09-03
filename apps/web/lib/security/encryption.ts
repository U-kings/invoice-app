import crypto from "node:crypto"

const ALGORITHM = "aes-256-gcm"
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const KEY_LENGTH = 32

function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY

  if (!key) {
    throw new Error("ENCRYPTION_KEY is not configured")
  }

  const buffer = Buffer.from(key, "base64")

  if (buffer.length !== KEY_LENGTH) {
    throw new Error("ENCRYPTION_KEY must be a base64-encoded 32-byte key")
  }

  return buffer
}

export function encryptSecret(value: string) {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ])

  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, authTag, encrypted]).toString("base64")
}

export function decryptSecret(encryptedValue: string) {
  const key = getEncryptionKey()
  const buffer = Buffer.from(encryptedValue, "base64")

  const iv = buffer.subarray(0, IV_LENGTH)
  const authTag = buffer.subarray(
    IV_LENGTH,
    IV_LENGTH + AUTH_TAG_LENGTH
  )
  const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH)

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}