"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({
  endTime,
  withBrackets = false,
}: {
  endTime: number;
  withBrackets?: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    // days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    // days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTimeMilliSeconds = endTime! * 1000;
      const now = new Date().getTime();
      const difference = endTimeMilliSeconds - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        };
      }

      return {
        // days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft();
      setTimeLeft(updatedTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const formatTime = (
    // days: number,
    hours: number,
    minutes: number,
    seconds: number
  ): string => {
    // return `${days}d ${hours.toString().padStart(2, "0")}h ${minutes
    //   .toString()
    //   .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;

    if (hours <= 0 && minutes <= 0 && seconds <= 0 && withBrackets) {
      return "";
    }

    if (withBrackets) {
       return `(${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s)`;
    }

    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  };

  return (
    <span>
      {formatTime(
        // timeLeft.days,
        timeLeft.hours,
        timeLeft.minutes,
        timeLeft.seconds
      )}
    </span>
  );
}
