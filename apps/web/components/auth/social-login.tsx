"use client";

import { motion } from "motion/react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaMicrosoft } from "react-icons/fa";

import { Button } from "@workspace/ui/components/button";

export function SocialLogin() {
  const providers = [
    {
      name: "Google",
      icon: FcGoogle,
    },
    // {
    //   name: "Microsoft",
    //   icon: FaMicrosoft,
    // },
    // {
    //   name: "Apple",
    //   icon: FaApple,
    // },
  ];

  return (
    <div className="grid gap-3">
      {providers.map(({ name, icon: Icon }) => (
        <motion.div
          key={name}
          whileHover={{ scale: 1.02, y: -2, }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            type="button"
            variant="outline"
            className="h-12 w-full justify-center gap-3"
          >
            <Icon className="text-lg" />
            Continue with {name}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}