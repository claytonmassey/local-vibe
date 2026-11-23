import { formatClock } from "@marketmap/domain";

export function statusLabel(status: string): string {
  switch (status) {
    case "confirmed_allowed":
      return "Confirmed allowed";
    case "restricted":
      return "Restricted";
    case "not_allowed":
      return "Not allowed";
    case "public":
      return "Public";
    case "private":
      return "Private";
    case "open_request":
      return "Open request";
    case "admin_approval":
      return "Admin approval";
    case "invitation":
      return "Invitation";
    case "core":
      return "Core";
    case "edge":
      return "Edge";
    case "outside":
      return "Outside";
    default:
      return "Unknown";
  }
}

export function distanceLabel(miles: number | null): string {
  if (miles == null) return "Distance unknown";
  return `${miles.toFixed(1)} mi`;
}

export function timeLabel(start: string | null, end: string | null): string {
  return formatClock(start, end);
}

export function money(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() }).format(cents / 100);
}
