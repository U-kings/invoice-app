"use client"

import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc"
import { Button } from "@workspace/ui/components/button"
import { toast } from "@workspace/ui/components/toast"

interface SocialLoginProps {
  termsAccepted?: boolean
}

export function SocialLogin({ termsAccepted = true }: SocialLoginProps) {
  const handleGoogleRedirectLogin = () => {
    // 1. Get the current page route path
    const isSignupPage = window.location.pathname.includes("signup")

    // 2. 🚀 THE CONDITIONAL FIX: Only block the user if they are actively trying to register
    if (isSignupPage && !termsAccepted) {
      toast.add({
        title: "Accept Terms and Conditions",
        description:
          "You must accept the terms and conditions before connecting with Google.",
        type: "error",
      })
      // alert(
      //   "You must accept the terms and conditions before connecting with Google."
      // )
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    const redirectUri = `${window.location.origin}/api/auth/google/callback`
    const googleAuthUrl = new URL(
      "https://accounts.google.com/o/oauth2/v2/auth"
    )

    googleAuthUrl.searchParams.append("client_id", clientId || "")
    googleAuthUrl.searchParams.append("redirect_uri", redirectUri)
    googleAuthUrl.searchParams.append("response_type", "code")
    googleAuthUrl.searchParams.append("scope", "openid email profile")
    googleAuthUrl.searchParams.append("access_type", "offline")
    googleAuthUrl.searchParams.append("prompt", "select_account")

    // Send the user to the correct page
    window.location.href = googleAuthUrl.toString()
  }

  return (
    <div className="w-full space-y-3">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleRedirectLogin}
          className="h-12 w-full justify-center gap-3 border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 dark:text-gray-300"
        >
          <FcGoogle className="text-xl" />
          <span>Continue with Google</span>
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
