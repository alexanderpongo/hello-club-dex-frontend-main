"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useRef } from "react";
import { useClientRouter } from "./useClientRouter";

type UrlStateOptions = {
  defaultValue?: string;
  validValues?: string[];
  replace?: boolean;
};

export function useUrlState(key: string, options: UrlStateOptions = {}) {
  const { defaultValue = "", validValues = [], replace = false } = options;
  const clientRouter = useClientRouter();
  const searchParams = useSearchParams();
  const lastValueRef = useRef<string>("");

  const getValue = useCallback(() => {
    const value = searchParams.get(key);
    if (validValues.length > 0 && value && validValues.includes(value)) {
      return value;
    }
    return value || defaultValue;
  }, [searchParams, key, validValues, defaultValue]);

  const [state, setState] = useState(() => {
    const initialValue = getValue();
    lastValueRef.current = initialValue;
    return initialValue;
  });

  // Update state when URL changes (but avoid infinite loops)
  useEffect(() => {
    const newValue = getValue();
    if (newValue !== lastValueRef.current) {
      lastValueRef.current = newValue;
      setState(newValue);
    }
  }, [getValue]);

  const updateState = useCallback(
    (newValue: string) => {
      // Prevent unnecessary state updates
      if (newValue === state) {
        return;
      }

      // Update refs to prevent loops
      lastValueRef.current = newValue;
      setState(newValue);

      // Only update URL on client-side to prevent SSR issues
      if (typeof window === "undefined") {
        return;
      }

      const newSearchParams = new URLSearchParams(searchParams.toString());
      const currentValue = newSearchParams.get(key);

      // Prevent unnecessary URL updates
      if (currentValue === newValue) {
        return;
      }

      // Update search params
      if (newValue && newValue !== defaultValue) {
        newSearchParams.set(key, newValue);
      } else {
        newSearchParams.delete(key);
      }

      // Build URL and update using pure client-side navigation
      const queryString = newSearchParams.toString();
      const newUrl = clientRouter.buildUrl(queryString);

      try {
        if (replace) {
          clientRouter.replace(newUrl);
        } else {
          clientRouter.push(newUrl);
        }
      } catch (error) {
        console.warn("URL update failed:", error);
      }
    },
    [searchParams, key, defaultValue, clientRouter, replace, state]
  );

  return [state, updateState] as const;
}

export function useUrlStateManager() {
  const clientRouter = useClientRouter();
  const searchParams = useSearchParams();

  const updateMultipleParams = useCallback(
    (updates: Record<string, string | null>) => {
      // Only update URL on client-side to prevent SSR issues
      if (typeof window === "undefined") {
        return;
      }

      // Use the enhanced router's updateQueryParams method
      const queryString = clientRouter.updateQueryParams(searchParams, updates);
      const newUrl = clientRouter.buildUrl(queryString);

      try {
        clientRouter.replace(newUrl);
      } catch (error) {
        console.warn("URL update failed:", error);
      }
    },
    [searchParams, clientRouter]
  );

  const clearParams = useCallback(
    (keysToRemove: string[]) => {
      // Only update URL on client-side to prevent SSR issues
      if (typeof window === "undefined") {
        return;
      }

      // Build updates object for clearing parameters
      const updates: Record<string, string | null> = {};
      keysToRemove.forEach((key) => {
        updates[key] = null;
      });

      // Use the enhanced router's updateQueryParams method
      const queryString = clientRouter.updateQueryParams(searchParams, updates);
      const newUrl = clientRouter.buildUrl(queryString);

      try {
        clientRouter.replace(newUrl);
      } catch (error) {
        console.warn("URL update failed:", error);
      }
    },
    [searchParams, clientRouter]
  );

  return { updateMultipleParams, clearParams };
}
