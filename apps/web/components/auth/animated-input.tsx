"use client";

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

interface AnimatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AnimatedInput = React.forwardRef<
  HTMLInputElement,
  AnimatedInputProps
>(({ label, error, className, ...props }, ref) => {
  const [focused, setFocused] = React.useState(false);

  return (
    <div className="relative">
      <input
        ref={ref}
        {...props}
        placeholder=" "
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "peer h-14 w-full rounded-xl border bg-background px-4 pt-5 text-sm outline-none transition-all",
          "focus:border-[#2EAFB4] focus:ring-2 focus:ring-[#2EAFB4]/20",
          error && "border-destructive",
          className
        )}
      />

      <label
        className={cn(
          "pointer-events-none absolute left-4 top-4 origin-left text-muted-foreground transition-all",
          "peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm",
          "peer-focus:top-2 peer-focus:scale-75 peer-focus:text-[#2EAFB4]",
          "peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:scale-75",
          focused && "text-[#2EAFB4]"
        )}
      >
        {label}
      </label>

      {error && (
        <p className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
});

AnimatedInput.displayName = "AnimatedInput";