"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Pure client-side router hook that uses browser History API only
 * This prevents App Router server re-execution and page refreshes
 */
export function useClientRouter() {
  const pathname = usePathname();

  const clientReplace = useCallback((url: string) => {
    // Only execute on client-side
    if (typeof window === "undefined") {
      return;
    }

    try {
      // Use browser History API directly - no Next.js navigation
      // This prevents server component re-execution
      window.history.replaceState(null, "", url);

      // Don't dispatch events to avoid infinite loops
      // Next.js useSearchParams will detect URL changes automatically
    } catch (error) {
      console.warn("Client router replace failed:", error);
    }
  }, []);

  const clientPush = useCallback((url: string) => {
    // Only execute on client-side
    if (typeof window === "undefined") {
      return;
    }

    try {
      // Use browser History API directly for push navigation
      window.history.pushState(null, "", url);

      // Don't dispatch events to avoid infinite loops
      // Next.js useSearchParams will detect URL changes automatically
    } catch (error) {
      console.warn("Client router push failed:", error);
    }
  }, []);

  const createQueryString = useCallback(
    (searchParams: URLSearchParams, name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    []
  );

  const deleteQueryParam = useCallback(
    (searchParams: URLSearchParams, name: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete(name);
      return params.toString();
    },
    []
  );

  const updateQueryParams = useCallback(
    (searchParams: URLSearchParams, updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value !== null) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      return params.toString();
    },
    []
  );

  const buildUrl = useCallback(
    (queryString: string) => {
      return queryString ? `${pathname}?${queryString}` : pathname;
    },
    [pathname]
  );

  return {
    push: clientPush,
    replace: clientReplace,
    createQueryString,
    deleteQueryParam,
    updateQueryParams,
    buildUrl
  };
}
