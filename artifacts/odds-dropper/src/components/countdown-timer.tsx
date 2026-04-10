import { useEffect, useRef } from "react";
import { subscribeToGlobalTick } from "@/lib/globalTick";

interface Props {
  commenceTime: Date | string;
}

function calcDisplay(commenceTime: Date | string): string {
  const now = Date.now();
  const target = new Date(commenceTime).getTime();
  const totalSeconds = Math.floor((target - now) / 1000);

  if (totalSeconds <= 0) return "Started";
  if (totalSeconds < 60) return `${totalSeconds}s`;

  const totalMins = Math.floor(totalSeconds / 60);
  if (totalMins < 60) {
    const secs = totalSeconds % 60;
    return `${totalMins}m ${secs.toString().padStart(2, "0")}s`;
  }

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function CountdownTimer({ commenceTime }: Props) {
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const update = () => {
      const text = calcDisplay(commenceTime);
      if (el.textContent !== text) {
        el.textContent = text;
        el.className = `text-xs font-mono font-semibold tabular-nums ${text === "Started" ? "text-amber-400" : "text-sky-400"}`;
      }
    };
    update();
    return subscribeToGlobalTick(update);
  }, [commenceTime]);

  const initial = calcDisplay(commenceTime);
  return (
    <span
      ref={spanRef}
      className={`text-xs font-mono font-semibold tabular-nums ${initial === "Started" ? "text-amber-400" : "text-sky-400"}`}
    >
      {initial}
    </span>
  );
}
