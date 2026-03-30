"use client";

import { Coffee } from "lucide-react";
import React, { useState, useEffect } from "react";
import { SoundToggle } from "./SoundToggle";
import { Button } from "../../ui/button";

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
    <div className="taskbar-clock ml-auto flex items-center gap-3">
      <div className="flex items-center space-x-1">
        <SoundToggle />
      </div>
      <div className="taskbar-clock ml-auto mr-2 text-sm font-medium whitespace-nowrap uppercase">
        {time
          ? time.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : ""}
      </div>
    </div>
  );
};
