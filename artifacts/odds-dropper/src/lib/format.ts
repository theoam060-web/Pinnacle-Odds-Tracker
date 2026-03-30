import { format, formatDistanceToNowStrict } from "date-fns";

export function formatOdds(odds: number): string {
  return odds.toFixed(3);
}

export function formatChange(change: number): string {
  const prefix = change > 0 ? "+" : "";
  return `${prefix}${change.toFixed(2)}%`;
}

export function formatTime(isoDate: string): string {
  return format(new Date(isoDate), "HH:mm:ss");
}

export function formatDate(isoDate: string): string {
  return format(new Date(isoDate), "MMM dd, yyyy");
}

export function formatTimeAgo(isoDate: string): string {
  return formatDistanceToNowStrict(new Date(isoDate), { addSuffix: true });
}
