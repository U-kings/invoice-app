"use client"

import { Button } from "@workspace/ui/components/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import React from "react"

export default function BackToSettings() {
  return (
    <>
      <Button
        variant="ghost"
        render={(props) => (
          <Link
            {...props}
            href="/dashboard/settings"
            className="mb-3 flex items-center gap-2 leading-0"
          />
        )}
      >
        <ArrowLeft className="size-4" />
        Back to settings
      </Button>
    </>
  )
}
