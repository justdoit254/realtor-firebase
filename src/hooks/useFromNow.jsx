import { useEffect, useState } from "react";

function getFromNow(timeInSeconds) {
  const now = new Date();
  const seconds = Math.floor((now - new Date(timeInSeconds * 1000)) / 1000);

  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (let i = 0; i < intervals.length; i++) {
    const interval = Math.floor(seconds / intervals[i].seconds);
    if (interval >= 1) {
      return `${interval} ${intervals[i].label}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

export function useFromNow(timestamp) {
  const [relativeTime, setRelativeTime] = useState(() =>
    getFromNow(timestamp.seconds)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRelativeTime(getFromNow(timestamp));
    }, 60000); // update every 1 minute

    return () => clearInterval(interval);
  }, [timestamp]);

  return relativeTime;
}
