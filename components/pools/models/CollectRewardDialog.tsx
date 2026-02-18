"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { useLPStore, useSwapStore } from "@/store/useDexStore";
import { Loader2 } from "lucide-react";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount, useConfig } from "wagmi";
import { waitForTransaction, writeContract } from "@wagmi/core";
import { Address, formatUnits } from "viem";
import { toast } from "react-toastify";
import Link from "next/link";
import { Position } from "@/types/lp-page.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

interface CollectRewardDialogProps {
  positionData: Position;
  isOwner?: boolean;
}

const CollectRewardDialog: React.FC<CollectRewardDialogProps> = (props) => {
  const { positionData, isOwner = true } = props;
  const { chainId, address } = useAccount();
  const config = useConfig();
  const [isCollectLoading, setIsCollectLoading] = useState(false);

  const [preventClose, setPreventClose] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const collectHandler = async () => {
    setIsCollectLoading(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];
    try {
      const hash = await writeContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as `0x${string}`,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "collect",
        args: [
          {
            tokenId: positionData.position_id,
            recipient: address as Address,
            amount0Max: BigInt("340282366920938463463374607431768211400"),
            amount1Max: BigInt("340282366920938463463374607431768211400"),
          },
        ],
        chainId,
      });

      const transactionReceipt = await waitForTransaction(config, {
        hash: hash!,
      });

      if (transactionReceipt.status === "success") {
        toast.success(
          <div>
            <p>Fees successfully collected.</p>
            <Link
              href={`${chainContractConfig.explorerURL}/tx/${transactionReceipt?.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline z-50"
            >
              View Transaction
            </Link>
          </div>,
          { toastId: "collect-success-toast" }
        );

        // setCollectFeeSuccess(true);
        // setPendingFee0("0.0");
        // setPendingFee1("0.0");

        // Close modal after 2 seconds
        setTimeout(() => setIsOpen(false), 2000);
      }
    } catch (error: any) {
      console.error("collect rewards error:", error);
      toast.error(error?.shortMessage, {
        toastId: "collect-rewards-error-toast",
      });
    } finally {
      setIsCollectLoading(false);
    }
  };
  const getTrimmedResult = (raw: string) => {
    const [intPart, decimalPart] = raw.split(".");
    if (!decimalPart) return raw;

    if (intPart === "0") {
      const firstNonZeroIndex = decimalPart.search(/[1-9]/);
      if (firstNonZeroIndex === -1) return "0";

      const sliceEnd = Math.min(firstNonZeroIndex + 3, 18);
      const trimmedDecimals = decimalPart.slice(0, sliceEnd).replace(/0+$/, "");

      return trimmedDecimals ? `0.${trimmedDecimals}` : "0";
    }

    // For non-zero intPart, return int with 2–3 decimals
    const trimmedDecimals = decimalPart.slice(0, 5).replace(/0+$/, "");
    return trimmedDecimals ? `${intPart}.${trimmedDecimals}` : intPart;
  };

  //   useEffect(() => {
  //     if (collectFeeSuccess) {
  //       setPreventClose(true);
  //       const timeout = setTimeout(() => {
  //         setPreventClose(false);
  //       }, 2500);
  //       return () => {
  //         clearTimeout(timeout);
  //       };
  //     }
  //   }, [collectFeeSuccess]);

  useEffect(() => {
    if (!isOpen) {
      console.log("collected");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        asChild
        disabled={
          !isOwner ||
          ((positionData.fees.uncollected.token0 as number) <= 0 &&
            (positionData.fees.uncollected.token1 as number) <= 0)
        }
      >
        <Button
          variant={"default"}
          className="dark:text-black font-lato font-semibold sm:text-sm sm:px-4 sm:h-9  text-xs sm:py-2 py-1 px-2 rounded-full dark:hover:bg-[#8FDD00] hover:bg-[#8fdd00] dark:bg-[#adff2f] w-full"
        >
          Collect Fees
        </Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(event) => {
          if (!preventClose) {
            event.preventDefault();
          }
        }}
        className="card-primary  border-[2px] right-0  px-1 sm:p-6 "
      >
        <DialogHeader>
          <DialogTitle>
            <div className="text-[16px] font-medium sm:font-semibold text-left">
              Collect fees
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-2">
          <div className="my-4 flex flex-col w-full border-[2px] p-2 dark:border-[#ffffff14] rounded-xl space-y-2">
            {/* <PairTokens /> */}
            <div className="flex items-center flex-row w-full">
              <div className="flex items-center flex-row w-full gap-2">
                <Avatar className="w-7 h-7 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                  <AvatarImage
                    src={positionData.pool.token0.logo}
                    alt={positionData.pool.token0.symbol}
                    width={28}
                    height={28}
                  />
                  <AvatarFallback>
                    {getInitials(positionData.pool.token0.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2">{positionData.pool.token0.symbol}</div>
              </div>
              <div className="flex">
                <div>
                  {renderFormattedValue(
                    positionData.fees.uncollected.token0 as number
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center flex-row w-full">
              <div className="flex items-center flex-row w-full gap-2">
                <Avatar className="w-7 h-7 rounded-full flex items-center justify-center border border-[rgba(255,255,255,0.1)] shadow-lg overflow-hidden bg-white -mr-2 ">
                  <AvatarImage
                    src={positionData.pool.token1.logo}
                    alt={positionData.pool.token1.symbol}
                    width={28}
                    height={28}
                  />
                  <AvatarFallback>
                    {getInitials(positionData.pool.token1.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-2">{positionData.pool.token1?.symbol!}</div>
              </div>
              <div className="flex">
                <div>
                  {renderFormattedValue(
                    positionData.fees.uncollected.token1 as number
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row grow gap-1.5 mt-4">
            <Button
              onClick={collectHandler}
              className="flex button-primary w-full h-10 uppercase"
              disabled={
                ((positionData.fees.uncollected.token0 as number) <= 0 &&
                  (positionData.fees.uncollected.token1 as number) <= 0) ||
                isCollectLoading
              }
            >
              {isCollectLoading && (
                <Loader2 size={20} className="animate-spin" />
              )}
              Collect{" "}
            </Button>
            {/* )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CollectRewardDialog;
