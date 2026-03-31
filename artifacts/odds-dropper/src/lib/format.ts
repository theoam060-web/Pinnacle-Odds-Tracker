import { format, formatDistanceToNowStrict, differenceInMinutes, differenceInHours } from "date-fns";

export function formatOdds(odds: number): string {
  return odds.toFixed(3);
}

export function formatChange(change: number): string {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(2)}%`;
}

export function formatTime(isoDate: string | Date): string {
  return format(new Date(isoDate), "HH:mm");
}

export function formatDate(isoDate: string | Date): string {
  return format(new Date(isoDate), "MMM dd, yyyy");
}

export function formatTimeAgo(isoDate: string | Date): string {
  return formatDistanceToNowStrict(new Date(isoDate), { addSuffix: true });
}

/**
 * Returns a compact countdown to a future date, e.g. "2h 15m" or "45m" or "Live".
 * Shows "Live" if the time has already passed.
 */
export function formatTimeUntil(isoDate: string | Date): string {
  const target = new Date(isoDate);
  const now = new Date();
  const totalMinutes = differenceInMinutes(target, now);

  if (totalMinutes <= 0) return "Live";
  if (totalMinutes < 60) return `${totalMinutes}m`;

  const hours = differenceInHours(target, now);
  const mins = totalMinutes - hours * 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
