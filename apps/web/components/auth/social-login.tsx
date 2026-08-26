"use client"

import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc"
import { useEffect } from "react"
import Script from "next/script"
import { useGoogleAuth } from "@/hooks/use-google-auth"
import { Button } from "@workspace/ui/components/button"
import { AuthLoader } from "./auth-loader"

interface SocialLoginProps {
  termsAccepted?: boolean
}

export function SocialLogin({ termsAccepted = true }: SocialLoginProps) {
  const { mutate, isPending } = useGoogleAuth()

  useEffect(() => {
    // 1. Initialize the global configuration variables on the client window object
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          mutate({
            idToken: response.credential,
            terms: termsAccepted,
          })
        },
      })
    }
  }, [mutate, termsAccepted])

  // 2. Custom Click Handler to trigger Google's official login popup manually 🚀
  const handleCustomGoogleClick = () => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      // Re-run initialization to make sure the runtime holds the latest terms condition state
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          mutate({
            idToken: response.credential,
            terms: termsAccepted,
          })
        },
      })
      
      // Open the standard Google sign-in window prompt overlay natively
      (window as any).google.accounts.id.prompt()
    } else {
      console.error("Google script layer has not finished initializing yet.")
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Asynchronously fetch the script background worker */}
      <Script 
        src="https://google.com" 
        strategy="afterInteractive"
        onLoad={() => {
          if ((window as any).google?.accounts?.id) {
            (window as any).google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: (response: any) => {
                mutate({ idToken: response.credential, terms: termsAccepted })
              },
            })
          }
        }}
      />

      {/* 🚀 CUSTOM ACTION BUTTON: Replaces the broken iframe anchor */}
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={handleCustomGoogleClick}
          className="h-12 w-full justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
        >
          {isPending ? <AuthLoader /> : <FcGoogle className="text-xl" />}
          <span>{isPending ? "Authenticating..." : "Continue with Google"}</span>
        </Button>
      </motion.div>
    </div>
  )
}


// {providers.map(({ name, icon: Icon }) => (
//   <motion.div
//     key={name}
//     whileHover={{ scale: 1.02, y: -2, }}
//     whileTap={{ scale: 0.98 }}
//   >
//     <Button
//       type="button"
//       variant="outline"
//       className="h-12 w-full justify-center gap-3"
//     >
//       <Icon className="text-lg" />
//       Continue with {name}
//     </Button>
//   </motion.div>
// ))}
//     const providers = [
//       {
//         name: "Google",
//         icon: FcGoogle,
//       },
//       // {
//       //   name: "Microsoft",
//       //   icon: FaMicrosoft,
//       // },
//       // {
//       //   name: "Apple",
//       //   icon: FaApple,
//       // },
//     ];
