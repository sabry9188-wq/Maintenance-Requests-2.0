"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 24,
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className="flex items-center gap-1" role={readOnly ? undefined : "radiogroup"}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(null)}
          className={cn("disabled:cursor-default", !readOnly && "cursor-pointer")}
          aria-label={`${n} star${n === 1 ? "" : "s"}`}
        >
          <Star
            size={size}
            className={n <= display ? "fill-primary-500 text-primary-500" : "fill-none text-neutral-300"}
          />
        </button>
      ))}
    </div>
  );
}
