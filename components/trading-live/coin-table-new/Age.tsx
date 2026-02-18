import { CreatedAtInfo } from "@/types/trading-live-table.types";
import React from "react";

interface AgeProps {
  created_at: CreatedAtInfo;
}

const Age: React.FC<AgeProps> = (props) => {
  const { created_at } = props;
  const formatAge = (tsSeconds: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = Math.max(0, now - tsSeconds); // guard against future timestamps

    const minute = 60;
    const hour = 60 * minute;
    const day = 24 * hour;
    const month = 30 * day; // approximate calendar month
    const year = 365 * day; // approximate year

    if (diff < minute) return "just now";
    if (diff < hour) {
      const m = Math.floor(diff / minute);
      return `${m}m`;
    }
    if (diff < day) {
      const h = Math.floor(diff / hour);
      return `${h}h`;
    }
    if (diff < month) {
      const d = Math.floor(diff / day);
      return `${d}d`;
    }
    if (diff < year) {
      const mo = Math.floor(diff / month);
      return `${mo}mo`;
    }
    const y = Math.floor(diff / year);
    return `${y}y`;
  };

  return <div>{formatAge(created_at.timestamp)}</div>;
};

export default Age;
