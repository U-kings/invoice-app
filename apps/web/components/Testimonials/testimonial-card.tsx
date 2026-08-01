"use client";

import { motion } from "motion/react";
import { Star } from "lucide-react";
import Image from "next/image";

interface TestimonialCardProps {
  name: string;
  role: string;
  company: string;
  image: string;
  quote: string;
}

export function TestimonialCard({
  name,
  role,
  company,
  image,
  quote,
}: TestimonialCardProps) {
  return (
    <motion.div
    //   whileHover={{
    //     y: -8,
    //   }}
    //   transition={{
    //     duration: 0.25,
    //   }}
      className="flex flex-col justify-between group h-full rounded-3xl border border-border/60 bg-card/60 p-7 backdrop-blur-xl transition-all hover:border-[#2EAFB4]/30 hover:shadow-[0_0px_0px_rgba(46,175,180,.15)]"
    //   className="group h-full rounded-3xl border border-border/60 bg-card/60 p-7 backdrop-blur-xl transition-all hover:border-[#2EAFB4]/30 hover:shadow-[0_20px_60px_rgba(46,175,180,.15)]"
    >
      <div className="flex gap-5">
        <Image
          src={image}
          alt={name}
          width={72}
          height={72}
          className="overflow-hidden w-18 h-18 rounded-full border-2 border-border object-cover"
        />

        <div className="flex-1">
          <p className="leading-8 text-muted-foreground">
            &quot;{quote}&quot;
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between">
        <div>
          <h4 className="text-xl font-semibold">
            {name}
          </h4>

          <p className="text-muted-foreground">
            {role}, {company}
          </p>
        </div>

        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-[#2EAFB4] text-[#2EAFB4]"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}