"use client"

import { Button } from "@workspace/ui/components/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
// import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  //   const [mounted, setMounted] = useState(false);

  // Instead of an effect, check conditions inline
  const isMountedAndReady = typeof window !== "undefined"

  //   useEffect(() => {
  //     setMounted(true);
  //   }, []);

  if (!isMountedAndReady) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}
