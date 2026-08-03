"use client";

import Link from "next/link";
import { MailCheck } from "lucide-react";
import { motion } from "motion/react";

import { Button } from "@workspace/ui/components/button";

export function VerifyEmail() {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      className="flex flex-col items-center text-center"
    >
      <div className="mb-6 rounded-full bg-[#2EAFB4]/10 p-6">
        <MailCheck className="h-12 w-12 text-[#2EAFB4]" />
      </div>

      <h1 className="text-3xl font-bold">
        Check your email
      </h1>

      <p className="mt-4 text-muted-foreground">
        We&apos;ve sent a password reset link to your
        email address.
      </p>

      <Button
        type="button"
        className="mt-8 w-full bg-[#2EAFB4] hover:bg-[#289ca0]"
      >
        <Link href="/login">
          Back to Login
        </Link>
      </Button>

      <button className="mt-6 text-sm text-[#2EAFB4]">
        Resend Email
      </button>
    </motion.div>
  );
}