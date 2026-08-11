"use client"

import { Button } from "@workspace/ui/components/button"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useSyncExternalStore } from "react"

// A dummy store that returns false on the server, true on the client
const emptySubscribe = () => () => {}
const clientSnapshot = () => true
const serverSnapshot = () => false

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

   // Safely registers whether we are hydrated on the client browser
  const isMounted = useSyncExternalStore(emptySubscribe, clientSnapshot, serverSnapshot)


  if (!isMounted) return null

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
