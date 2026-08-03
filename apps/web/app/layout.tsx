import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"
import { Toaster } from "@workspace/ui/components/toast"
import Providers from "./provider"
import { Metadata } from "next"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Invoice App",
  description:
    "Create invoices, accept payments via Paystack, and automatically send receipts to your customers — all in one place.",
  // description: "Made to help with payments",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
      data-scroll-behavior="smooth"
    >
      <body suppressHydrationWarning={true}>
        <Providers>
          <ThemeProvider>{children}</ThemeProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
