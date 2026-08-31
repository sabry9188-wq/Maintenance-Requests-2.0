"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function SimpleBarChart({
  data,
  dataKey = "count",
  labelKey = "label",
  color = "#dc2626",
  horizontal = false,
}: {
  data: { label: string; count: number }[];
  dataKey?: string;
  labelKey?: string;
  color?: string;
  horizontal?: boolean;
}) {
  if (data.length === 0) {
    return <p className="py-10 text-center text-sm text-neutral-400">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ top: 4, right: 12, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey={labelKey} width={140} tick={{ fontSize: 12 }} />
          </>
        ) : (
          <>
            <XAxis dataKey={labelKey} tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
          </>
        )}
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
