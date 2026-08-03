"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "../logo";

interface AuthBrandProps {
  title: string;
  subtitle: string;
}

export function AuthBrand({
  title,
  subtitle,
}: AuthBrandProps) {
  return (
    <>
      {/* Logo */}
      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex items-center justify-center"
      >
        {/* <Link
          href="/"
          className="inline-flex items-center"
        > */}
          {/* Replace this with your logo */}
        <Logo/>
        {/* </Link> */}
      </motion.div>

      {/* Trust Badge */}
      {/* <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.15,
        }}
        className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#2EAFB4]/20 bg-[#2EAFB4]/10 px-4 py-2"
      >
        <ShieldCheck className="h-4 w-4 text-[#2EAFB4]" />

        <span className="text-sm font-medium text-[#2EAFB4]">
          Trusted by 20,000+ businesses
        </span>
      </motion.div> */}

      {/* Heading */}
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.25,
        }}
        className="mt-5 mb-4 flex justify-center text-center flex-col gap-2"
      >
        <h1 className="text-4xl font-bold">
          {title}
        </h1>

        <p className="mt-3 text-muted-foreground">
          {subtitle}
        </p>
      </motion.div>
    </>
  );
}