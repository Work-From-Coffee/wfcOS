"use client";

import React, { useEffect, useState } from "react";

export const TaskbarClock = () => {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time once client-side
    setTime(new Date());

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="taskbar-clock ml-auto mr-2 text-sm font-medium whitespace-nowrap uppercase">
      {time
        ? time.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : ""}
    </div>
  );
};
