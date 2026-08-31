"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { REQUEST_STATUSES, STATUS_LABELS, PRIORITIES, PRIORITY_LABELS } from "@/lib/types/domain";

interface FilterOptions {
  stations: { id: string; name: string }[];
  departments: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function RequestFilters({ options }: { options: FilterOptions }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [station, setStation] = useState(searchParams.get("station") ?? "");
  const [department, setDepartment] = useState(searchParams.get("department") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [priority, setPriority] = useState(searchParams.get("priority") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [dateFrom, setDateFrom] = useState(searchParams.get("date_from") ?? "");
  const [dateTo, setDateTo] = useState(searchParams.get("date_to") ?? "");

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    const set = (key: string, value: string) => (value ? params.set(key, value) : params.delete(key));
    set("station", station);
    set("department", department);
    set("status", status);
    set("priority", priority);
    set("category", category);
    set("date_from", dateFrom);
    set("date_to", dateTo);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setStation("");
    setDepartment("");
    setStatus("");
    setPriority("");
    setCategory("");
    setDateFrom("");
    setDateTo("");
    const params = new URLSearchParams(searchParams.toString());
    ["station", "department", "status", "priority", "category", "date_from", "date_to", "page"].forEach((k) =>
      params.delete(k)
    );
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <Select value={station} onChange={(e) => setStation(e.target.value)}>
          <option value="">All Stations</option>
          {options.stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">All Departments</option>
          {options.departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {options.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button size="sm" variant="outline" onClick={clearFilters}>
          <X className="h-3.5 w-3.5" /> Clear Filters
        </Button>
      </div>
    </div>
  );
}
