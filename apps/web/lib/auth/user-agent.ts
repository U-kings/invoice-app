export type ParsedUserAgent = {
  browser: string
  browserVersion: string | null
  operatingSystem: string
}

export function parseUserAgent(userAgent: string | null): ParsedUserAgent {
  if (!userAgent) {
    return {
      browser: "Unknown browser",
      browserVersion: null,
      operatingSystem: "Unknown device",
    }
  }

  let browser = "Unknown browser"
  let browserVersion: string | null = null

  // Edge must be checked before Chrome because Edge includes Chrome in its UA.
  const edgeMatch = userAgent.match(/(?:Edg|Edge)\/([\d.]+)/i)

  const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/i)

  const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/i)

  const safariMatch = userAgent.match(/Version\/([\d.]+).*Safari\//i)

  if (edgeMatch) {
    browser = "Microsoft Edge"
    browserVersion = edgeMatch[1] ?? null
  } else if (chromeMatch) {
    browser = "Google Chrome"
    browserVersion = chromeMatch[1] ?? null
  } else if (firefoxMatch) {
    browser = "Mozilla Firefox"
    browserVersion = firefoxMatch[1] ?? null
  } else if (safariMatch) {
    browser = "Safari"
    browserVersion = safariMatch[1] ?? null
  }

  let operatingSystem = "Unknown device"

  if (/Windows NT/i.test(userAgent)) {
    operatingSystem = "Windows"
  } else if (/Mac OS X/i.test(userAgent)) {
    operatingSystem = "macOS"
  } else if (/Android/i.test(userAgent)) {
    operatingSystem = "Android"
  } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
    operatingSystem = "iOS"
  } else if (/Linux/i.test(userAgent)) {
    operatingSystem = "Linux"
  }

  return {
    browser,
    browserVersion,
    operatingSystem,
  }
}
