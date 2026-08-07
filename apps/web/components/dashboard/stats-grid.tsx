"use client";

import { stats } from "./stats";
import { StatCard } from "./stat-card";

export function StatsGrid() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          stat={stat}
        />
      ))}
    </section>
  );
}