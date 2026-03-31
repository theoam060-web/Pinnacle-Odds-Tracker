import { useState, useEffect } from "react";

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
  const secs = totalSeconds % 60;

  if (totalMins < 60) {
    return `${totalMins}m ${secs.toString().padStart(2, "0")}s`;
  }

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  if (mins === 0 && secs === 0) return `${hours}h`;
  if (secs === 0) return `${hours}h ${mins}m`;
  return `${hours}h ${mins}m`;
}

export function CountdownTimer({ commenceTime }: Props) {
  const [display, setDisplay] = useState(() => calcDisplay(commenceTime));

  useEffect(() => {
    setDisplay(calcDisplay(commenceTime));
    const interval = setInterval(() => {
      setDisplay(calcDisplay(commenceTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [commenceTime]);

  const started = display === "Started";

  return (
    <span className={`text-xs font-mono font-semibold tabular-nums ${started ? "text-amber-400" : "text-sky-400"}`}>
      {display}
    </span>
  );
}
