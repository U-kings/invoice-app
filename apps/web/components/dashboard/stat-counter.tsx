"use client";

import CountUp from "react-countup";

interface StatCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
}: StatCounterProps) {
  return (
    <CountUp
      end={value}
      duration={2}
      separator=","
      decimals={decimals}
      prefix={prefix}
      suffix={suffix}
    />
  );
}