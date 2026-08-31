"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#dc2626", "#2563eb", "#16a34a", "#d97706", "#9333ea", "#0891b2", "#78716c", "#b91c1c"];

export function SimplePieChart({ data }: { data: { label: string; count: number }[] }) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-400">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" cx="50%" cy="50%" outerRadius={90} label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
