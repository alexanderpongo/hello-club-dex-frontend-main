"use client";

import { useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Simple URL state hook that uses browser History API directly
 * This prevents App Router server re-execution and infinite loops
 */
export function useSimpleUrlState(key: string, defaultValue: string = "") {
  const searchParams = useSearchParams();

  // Get current value from URL
  const value = searchParams.get(key) || defaultValue;

  // Update URL without triggering navigation
  const setValue = useCallback(
    (newValue: string) => {
      if (typeof window === "undefined") {
        return;
      }

      const params = new URLSearchParams(searchParams.toString());

      if (newValue && newValue !== defaultValue) {
        params.set(key, newValue);
      } else {
        params.delete(key);
      }

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      // Use browser History API directly - no Next.js navigation
      try {
        window.history.replaceState(null, "", newUrl);
      } catch (error) {
        console.warn("Failed to update URL:", error);
      }
    },
    [searchParams, key, defaultValue]
  );

  return [value, setValue] as const;
}
