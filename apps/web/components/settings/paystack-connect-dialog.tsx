"use client"

import { useEffect, useState } from "react"
import { Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

import { useConnectPaystack } from "@/hooks/use-payment-provider-connections"

interface PaystackConnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PaystackConnectDialog({
  open,
  onOpenChange,
}: PaystackConnectDialogProps) {
  const [secretKey, setSecretKey] = useState("")
  const [showSecretKey, setShowSecretKey] = useState(false)

  const connectMutation = useConnectPaystack()

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSecretKey("")
      setShowSecretKey(false)
      connectMutation.reset()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const value = secretKey.trim()

    if (!value) {
      return
    }

    connectMutation.mutate(value, {
      onSuccess: () => {
        setSecretKey("")
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>

            <DialogTitle>Connect Paystack</DialogTitle>

            <DialogDescription>
              Enter your Paystack secret key to connect your Paystack account
              and receive online payments.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-5">
            <div className="space-y-2">
              <Label htmlFor="paystack-secret-key">Secret key</Label>

              <div className="relative">
                <Input
                  id="paystack-secret-key"
                  type={showSecretKey ? "text" : "password"}
                  value={secretKey}
                  onChange={(event) => setSecretKey(event.target.value)}
                  placeholder="sk_test_..."
                  autoComplete="off"
                  spellCheck={false}
                  disabled={connectMutation.isPending}
                  className="pr-10 font-mono text-sm"
                />

                <button
                  type="button"
                  onClick={() => setShowSecretKey((value) => !value)}
                  disabled={connectMutation.isPending || !secretKey}
                  aria-label={
                    showSecretKey ? "Hide secret key" : "Show secret key"
                  }
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
                >
                  {showSecretKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Your secret key is encrypted before it is stored and is never
                exposed to your browser after submission.
              </p>
            </div>

            <div className="rounded-xl border bg-muted/40 p-3.5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    Your credentials are protected
                  </p>

                  <p className="text-xs leading-5 text-muted-foreground">
                    We use your key only on the server to communicate with
                    Paystack. Never share your secret key publicly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={connectMutation.isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={!secretKey.trim() || connectMutation.isPending}
            >
              {connectMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}

              {connectMutation.isPending ? "Connecting..." : "Connect Paystack"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
