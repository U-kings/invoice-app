"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface PricingCardProps {
  title: string;
  description: string;
  price: string;
  period: string;
  features: string[];
  buttonText: string;
  popular?: boolean;
}

export function PricingCard({
  title,
  description,
  price,
  period,
  features,
  buttonText,
  popular = false,
}: PricingCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -8,
      }}
      transition={{
        duration: 0.25,
      }}
      className={cn(
        "relative rounded-3xl border bg-card/60 backdrop-blur-xl",
        // "relative overflow-hidden rounded-3xl border bg-card/60 backdrop-blur-xl",
        "p-8 transition-all",
        popular
          ? "border-[#2EAFB4] shadow-[0_20px_80px_rgba(46,175,180,.18)]"
          : "border-border/60 hover:border-[#2EAFB4]/40"
      )}
    >
      {popular && (
        <div className="absolute left-1/2 z-70 top-0 -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-full bg-[#2EAFB4] px-6 py-2 text-sm font-semibold text-white shadow-lg">
            Most Popular
          </div>
        </div>
      )}

      <h3
        className={cn(
          "text-4xl font-bold",
          popular && "text-[#2EAFB4]"
        )}
      >
        {title}
      </h3>

      <p className="mt-2 text-muted-foreground">
        {description}
      </p>

      <div className="mt-8 flex items-end gap-2">
        <span className="text-6xl font-bold">{price}</span>
        <span className="pb-2 text-2xl text-muted-foreground">
          {period}
        </span>
      </div>

      <p className="mt-2 text-muted-foreground">
        {popular ? "Billed monthly" : "Free forever"}
      </p>

      <ul className="mt-10 space-y-5">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3"
          >
            <Check className="h-5 w-5 text-[#2EAFB4]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        className={cn(
          "mt-10 h-14 w-full text-base",
          popular
            ? "bg-[#2EAFB4] hover:bg-[#26989d]"
            : "variant-outline"
        )}
        variant={popular ? "default" : "outline"}
      >
        {buttonText}
      </Button>
    </motion.div>
  );
}