"use client";
import React, { useEffect, useTransition } from "react";
import { EyeIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLPStore, useSwapStore } from "@/store/useDexStore";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";
import { getFeeTier } from "./columns";

const Actions = ({ row }: { row: any }) => {
  const { chainId } = useAccount();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address } = useAccount();
  const { setDataRow } = useSwapStore();
  const { openConnectModal } = useConnectModal();
  const [isPending, startTransition] = useTransition();
  const {
    setActiveStep,
    setFromLPToken,
    setToLPToken,
    setFromLPTokenInputAmount,
    setToLPTokenInputAmount,
    setFeeTier,
    setActivePriceRange,
    setTickLowerPrice,
    setTickUpperPrice,
    setTickSpace,
    setPoolFee,
    setHandleContribute,
    setFromLpTokenApprovedAmount,
    setToLpTokenApprovedAmount,
    poolAddress,
    setPoolAddress,
  } = useLPStore();

  const handleClick = () => {
    setDataRow(row);
    if (!address) {
      openConnectModal?.(); // safe call in case it's undefined
    } else {
      router.push(`pools/${row?.id}`);
    }
  };

  const handleContribute = (value: string) => {
    // Helper function to determine if a token should be treated as native
    const isNativeToken = (token: any) => {
      if (!token) return false;

      // Check if the token is explicitly marked as native
      if (token.address === "native") return true;

      // Check if it's a wrapped native token that should be treated as native
      const wrappedNativeAddresses = [
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB on BSC
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH on Ethereum
        "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd", // WBNB on BSC Testnet
        "0x4200000000000000000000000000000000000006", // WETH on Base
      ];

      const isWrappedNative = wrappedNativeAddresses.includes(
        token.address?.toLowerCase()
      );

      // Also check by symbol and name for common native tokens
      const isNativeBySymbol =
        (token.symbol === "BNB" && chainId === 56) ||
        (token.symbol === "ETH" && (chainId === 1 || chainId === 8453)) ||
        (token.symbol === "TBNB" && chainId === 97);

      const isNativeByName =
        (token.name?.toLowerCase().includes("binance coin") &&
          chainId === 56) ||
        (token.name?.toLowerCase().includes("ethereum") &&
          (chainId === 1 || chainId === 8453));

      const shouldBeNative =
        isWrappedNative || isNativeBySymbol || isNativeByName;

      return shouldBeNative;
    };

    // Create properly formatted tokens that match the normal flow structure
    const formattedToken0 = {
      name: row?.token0?.name || "Token 0",
      symbol: row?.token0?.symbol || "T0",
      address: isNativeToken(row?.token0) ? "native" : row?.token0?.address,
      decimals: row?.token0?.decimal || row?.token0?.decimals || 18,
      chainId: row?.token0?.chainId || chainId,
      logoURI: row?.token0?.logoURI || "",
    };

    const formattedToken1 = {
      name: row?.token1?.name || "Token 1",
      symbol: row?.token1?.symbol || "T1",
      address: isNativeToken(row?.token1) ? "native" : row?.token1?.address,
      decimals: row?.token1?.decimal || row?.token1?.decimals || 18,
      chainId: row?.token1?.chainId || chainId,
      logoURI: row?.token1?.logoURI || "",
    };

    const feeTier = getFeeTier(row);

    // Batch all state updates synchronously - Zustand updates are synchronous
    // Reset state
    setActiveStep(1);
    setFromLPToken(null);
    setToLPToken(null);
    setFromLPTokenInputAmount("");
    setToLPTokenInputAmount("");
    setFromLpTokenApprovedAmount("0.0");
    setToLpTokenApprovedAmount("0.0");
    setTickSpace(60);
    setActivePriceRange(0);
    setTickLowerPrice("0");
    setTickUpperPrice("0");
    setPoolFee(feeTier * 10000);

    // Set new tokens immediately (no delay needed)
    setFromLPToken(formattedToken0);
    setToLPToken(formattedToken1);
    setFeeTier(feeTier.toString());
    setHandleContribute(true);
    setPoolAddress(row.poolAddress);

    // Use startTransition for non-urgent navigation to prevent blocking
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set("contribute", row?.id);
    // newSearchParams.set("chainId", chainId!.toString());

    console.log("newSearchParams", newSearchParams.toString());

    startTransition(() => {
      router.push(`/lp?${newSearchParams.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-2 w-full h-full z-50">
      <div>
        <Button
          size={"sm"}
          className=" button-primary !font-lato !text-xs !h-6 !w-fit"
          onClick={() => handleContribute("lp")}
          disabled={isPending}
        >
          {isPending ? "Loading..." : "Contribute"}
        </Button>
      </div>
      <div onClick={handleClick}>
        <EyeIcon size={20} className="cursor-pointer text-[#A3A3A3] w-4 h-4" />
      </div>
    </div>
  );
};

export default Actions;
