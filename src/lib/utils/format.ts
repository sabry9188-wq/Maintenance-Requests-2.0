import { format } from "date-fns";

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  return format(new Date(iso), "dd MMM yyyy HH:mm");
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  return format(new Date(iso), "dd MMM yyyy");
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "AED",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatMinutesAsDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "-";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}
