import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Checkbox = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-2 focus:ring-primary-500",
        className
      )}
      {...props}
    />
  )
);
Checkbox.displayName = "Checkbox";
