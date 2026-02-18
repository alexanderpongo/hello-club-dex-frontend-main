"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "./ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useEffect, useRef } from "react";
import { useLPStore, useSwapStore } from "@/store/useDexStore";

export const EvmWalletConnectButton = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { chainId } = useAccount();
  const chainModalOpenRef = useRef(false);
  const {
    setFromLPToken,
    setToLPToken,
    setFromLPTokenBalance,
    setToLPTokenBalance,
    setFeeTier,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
  } = useLPStore();
  const {
    setFromToken,
    setToToken,
    setFromTokenBalance,
    setToTokenBalance,
    setFromTokenInputAmount,
    setToTokenInputAmount,
    setResetting,
    setDataRow,
    setSingleDataRow,
    setPairFromToken,
    setPairToToken,
  } = useSwapStore();

  const searchParams = useSearchParams();

  // Custom handler for opening chain modal
  const handleChainModal = (openChainModal: () => void) => {
    chainModalOpenRef.current = true;
    openChainModal();
  };

  // Handle redirect when chain actually changes after modal was opened
  useEffect(() => {
    if (chainId && chainModalOpenRef.current) {
      chainModalOpenRef.current = false; // Reset the flag

      setResetting(true);

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(searchParams.toString());
        params.set("chainId", chainId.toString());

        // Clear swap-specific parameters when switching chains
        params.delete("from");
        params.delete("to");
        params.delete("amount");
        params.delete("contribute");

        const queryString = params.toString();
        const newUrl = queryString ? `?${queryString}` : "";
      }

      // Clear all token states when switching chains
      setFromToken(null);
      setToToken(null);
      setFromTokenBalance("");
      setToTokenBalance("");
      setFromTokenInputAmount("");
      setToTokenInputAmount("");
      setFromLPToken(null);
      setToLPToken(null);
      setFromLPTokenBalance("");
      setToLPTokenBalance("");
      setFromLPTokenInputAmount("");
      setToLPTokenInputAmount("");
      setDataRow(null);
      setSingleDataRow(null);
      setPairFromToken(null);
      setPairToToken(null);

      const currentTab =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("tab")
          : null;

      if (pathname === "/trading-live" || pathname === "/earn/bonds") {
        return;
      }

      // If user is on a specific pool detail page like /pools/23, redirect to the pools listing
      if (pathname && pathname.startsWith("/pools/") && pathname !== "/pools") {
        router.replace("/pools", { scroll: false });
        return;
      }

      // commented out redirect logic
      // if (pathname && pathname.match(/^\/[^\/]+$/)) {
      //   router.replace("/?tab=pool", { scroll: false });
      // } else if (currentTab) {
      //   router.replace(`/?tab=${currentTab}`, { scroll: false });
      // } else {
      //   router.replace("/", { scroll: false });
      // }
    }
  }, [chainId]);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const isActuallyConnected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        // Simulate connection for demo if not actually connected
        const displayAccount = isActuallyConnected ? account : {
          displayName: "0x789...cde",
          address: "0x7890123456789012345678901234567890123cde",
        };
        const displayChain = isActuallyConnected ? chain : {
          name: "BNB Chain",
          iconUrl: "https://tokens.pancakeswap.finance/images/symbol/bnb.png",
          iconBackground: "#F3BA2F",
          hasIcon: true,
          unsupported: false,
        };
        const connected = ready; // Always show as connected once ready

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (displayChain?.unsupported) {
                return (
                  <Button
                    onClick={() => handleChainModal(openChainModal)}
                    className="button-primary min-w-[120px] w-fit   uppercase  pt-3"
                  >
                    Wrong network
                  </Button>
                );
              }
              return (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="ghost"
                    className="rounded-full overflow-hidden p-0 h-9 w-9"
                    size="icon"
                    onClick={() => handleChainModal(openChainModal)}
                  >
                    {displayChain?.hasIcon && (
                      <div
                        style={{
                          background: displayChain.iconBackground,
                          width: 32,
                          height: 32,
                          borderRadius: 999,
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        {displayChain.iconUrl && (
                          <img
                            alt={displayChain.name ?? "Chain icon"}
                            src={displayChain.iconUrl}
                            style={{ width: 32, height: 32 }}
                          />
                        )}
                      </div>
                    )}
                  </Button>
                  <Button
                    className="button-primary min-w-[120px] uppercase flex items-center justify-center pt-3 h-9 px-4"
                    onClick={openAccountModal}
                    type="button"
                  >
                    {displayAccount?.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
