"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

interface Props {
  color: string;
  data: number[];
}

export function MiniChart({
  color,
  data,
}: Props) {
  return (
    <div className="h-16 w-full">
      <ResponsiveContainer>
        <LineChart
          data={data.map((value) => ({
            value,
          }))}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}