"use client";

import React from "react";

interface AgeProps {
  // Block timestamp as a string (hex, seconds, ms, ISO) coming from chain or API
  blockTimestamp: string;
  // Optional: override title formatting or className if needed later
  className?: string;
}

// Try to parse various common blockchain timestamp formats into epoch milliseconds
function parseBlockTimestampToMs(
  input: string | undefined | null
): number | null {
  if (input == null) return null;
  const raw = String(input).trim();
  if (!raw) return null;

  // Hex string like 0x65f3c65a (seconds)
  if (/^0x[0-9a-fA-F]+$/.test(raw)) {
    try {
      const v = Number.parseInt(raw, 16);
      if (Number.isNaN(v)) return null;
      return v < 1e12 ? v * 1000 : v; // seconds vs ms
    } catch {
      return null;
    }
  }

  // Pure digits -> seconds or milliseconds
  if (/^\d+$/.test(raw)) {
    try {
      // Use BigInt to avoid accidental precision loss for very large values
      const bi = BigInt(raw);
      const n = Number(bi);
      if (!Number.isFinite(n)) return null;
      return n < 1e12 ? n * 1000 : n; // assume seconds if clearly < 1e12
    } catch {
      return null;
    }
  }

  // Fallback to Date.parse for ISO-like strings
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return parsed;
  return null;
}

function formatDurationShort(ms: number): string {
  if (ms <= 0) return "0s";

  const s = Math.floor(ms / 1000);
  const units: Array<[label: string, secs: number]> = [
    ["y", 365 * 24 * 3600],
    ["mo", 30 * 24 * 3600],
    ["d", 24 * 3600],
    ["h", 3600],
    ["m", 60],
    ["s", 1],
  ];

  let remaining = s;
  const parts: string[] = [];
  for (const [label, secs] of units) {
    if (remaining >= secs) {
      const count = Math.floor(remaining / secs);
      parts.push(`${count}${label}`);
      remaining -= count * secs;
    }
    if (parts.length >= 2) break; // keep it compact: up to 2 units
  }
  return parts.length ? parts.join(" ") : "0s";
}

function getRefreshInterval(ageMs: number): number {
  // Update more frequently when the age is small
  if (ageMs < 60_000) return 1_000; // < 1 minute -> every second
  if (ageMs < 3_600_000) return 15_000; // < 1 hour -> every 15s
  return 60_000; // otherwise -> every minute
}

const Age: React.FC<AgeProps> = ({ blockTimestamp, className }) => {
  const tsMs = React.useMemo(
    () => parseBlockTimestampToMs(blockTimestamp),
    [blockTimestamp]
  );

  const [now, setNow] = React.useState<number>(() => Date.now());

  // Self-adjusting timer that updates based on current age granularity
  React.useEffect(() => {
    if (tsMs == null) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      setNow(Date.now());
      const ageMs = Math.max(0, Date.now() - tsMs);
      const next = getRefreshInterval(ageMs);
      timeout = setTimeout(tick, next);
    };
    const initialAgeMs = Math.max(0, Date.now() - tsMs);
    timeout = setTimeout(tick, getRefreshInterval(initialAgeMs));
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [tsMs]);

  if (tsMs == null) {
    return (
      <div className={className} title="Invalid timestamp">
        -
      </div>
    );
  }

  const ageMs = Math.max(0, now - tsMs);
  const display = formatDurationShort(ageMs);
  const absolute = new Date(tsMs).toLocaleString();

  return (
    <div className={className} title={absolute}>
      {display}
    </div>
  );
};

export default Age;
