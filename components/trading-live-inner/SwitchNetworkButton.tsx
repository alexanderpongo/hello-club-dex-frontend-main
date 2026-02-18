"use client";
import { Button } from "../ui/button";
import { switchChain } from "@wagmi/core";
import { useConfig } from "wagmi";
import { useState } from "react";

interface SwitchNetworkButtonProps {
  targetChainId: number;
  chainName: string;
}

export default function SwitchNetworkButton({
  targetChainId,
  chainName,
}: SwitchNetworkButtonProps) {
  const config = useConfig();
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitchChain = async () => {
    try {
      setIsSwitching(true);
      await switchChain(config, { chainId: targetChainId });
    } catch (error) {
      console.error("Error switching chain:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <Button
      onClick={handleSwitchChain}
      disabled={isSwitching}
      className="button-primary px-6 py-2 h-9 text-sm uppercase"
    >
      {isSwitching ? "Switching..." : `Switch to ${chainName}`}
    </Button>
  );
}
