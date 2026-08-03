"use client";

import { LoginForm } from "@/components/auth/login-form";
import { motion } from "motion/react";

export default function LoginPage() {
  return <motion.div
  initial={{
    opacity: 0,
    x: 40,
  }}
  animate={{
    opacity: 1,
    x: 0,
  }}
  exit={{
    opacity: 0,
    x: -40,
  }}
  transition={{
    duration: 0.4,
  }}
>
  <LoginForm />
  </motion.div>;
}