"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useClientRouter } from "./useClientRouter";

interface TokenUrlSyncOptions {
  fromToken: any;
  toToken: any;
  fromAmount?: string;
  isResetting?: boolean;
}

export function useTokenUrlSync({
  fromToken,
  toToken,
  fromAmount,
  isResetting
}: TokenUrlSyncOptions) {
  const clientRouter = useClientRouter();
  const searchParams = useSearchParams();
  const { chainId } = useAccount();
  const lastUpdateRef = useRef<string>("");

  const updateTokensInUrl = useCallback(() => {
    if (!chainId || isResetting) {
      return;
    }

    // Only update URL if we're on the trade tab to avoid conflicts
    const currentTab = searchParams.get("tab");

    if (currentTab !== "trade" && currentTab !== null) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    // Only update chainId if it's not already set or matches current chainId
    const urlChainId = searchParams.get("chainId");
    if (!urlChainId || urlChainId === chainId.toString()) {
      params.set("chainId", chainId.toString());
    }

    // Ensure we're on trade tab
    if (!currentTab) {
      params.set("tab", "trade");
    }

    // Handle fromToken
    if (fromToken) {
      const fromAddress =
        fromToken.address === "native"
          ? "native"
          : fromToken.address.toLowerCase();
      params.set("from", fromAddress);
    } else {
      params.delete("from");
    }

    // Handle toToken
    if (toToken) {
      const toAddress =
        toToken.address === "native" ? "native" : toToken.address.toLowerCase();
      params.set("to", toAddress);
    } else {
      params.delete("to");
    }

    // Handle amount
    if (fromAmount && fromAmount !== "0" && fromAmount !== "") {
      params.set("amount", fromAmount);
    } else {
      params.delete("amount");
    }

    // Only update URL if there are actual changes
    const queryString = params.toString();
    const newUrl = clientRouter.buildUrl(queryString);
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";

    // Prevent unnecessary updates using ref comparison
    if (lastUpdateRef.current !== newUrl && currentUrl !== newUrl) {
      lastUpdateRef.current = newUrl;

      // Use pure client-side navigation to prevent server re-execution
      try {
        if (typeof window !== "undefined") {
          clientRouter.replace(newUrl);
        }
      } catch (error) {
        console.warn("Token URL sync failed:", error);
      }
    }
  }, [
    fromToken,
    toToken,
    fromAmount,
    chainId,
    isResetting,
    searchParams,
    clientRouter
  ]);

  // Update URL when tokens change (but not when chainId changes rapidly)
  useEffect(() => {
    // Only update if tokens actually exist
    if (fromToken || toToken) {
      const timer = setTimeout(updateTokensInUrl, 200);
      return () => clearTimeout(timer);
    }
  }, [fromToken, toToken, fromAmount]); // Remove chainId from dependencies

  return { updateUrl: updateTokensInUrl };
}

export function useTokenUrlRestore() {
  const searchParams = useSearchParams();
  const { chainId } = useAccount();

  const getTokenParamsFromUrl = useCallback(() => {
    const urlChain = searchParams.get("chainId");
    const urlFrom = searchParams.get("from");
    const urlTo = searchParams.get("to");
    const currentTab = searchParams.get("tab");

    // Only restore if we're on the trade tab and chain matches
    if (currentTab !== "trade" || !urlChain || !chainId) {
      return { from: null, to: null, shouldRestore: false };
    }

    if (chainId.toString() !== urlChain) {
      return { from: null, to: null, shouldRestore: false };
    }

    return {
      from: urlFrom,
      to: urlTo,
      shouldRestore: true,
      chainId: parseInt(urlChain)
    };
  }, [searchParams, chainId]);

  return { getTokenParamsFromUrl };
}
