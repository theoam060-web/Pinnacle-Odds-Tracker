import { useState, useEffect } from "react";
import { formatDistanceToNowStrict } from "date-fns";

export function LiveTimestamp({ date, prefix = "" }: { date: string | undefined; prefix?: string }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    if (!date) return;

    const update = () => {
      setTimeAgo(formatDistanceToNowStrict(new Date(date), { addSuffix: true }));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [date]);

  if (!date) return null;

  return (
    <span className="text-xs text-muted-foreground tabular-nums tracking-tight">
      {prefix} {timeAgo}
    </span>
  );
}
