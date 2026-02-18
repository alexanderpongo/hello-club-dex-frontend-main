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

const CollectRewardDialog = () => {
  const { chainId, address } = useAccount();
  const config = useConfig();
  const [isColectLoading, setIsCollectLoading] = useState(false);
  const { dataRow, pairFromToken, pairToToken } = useSwapStore();
  const {
    pendingFee0,
    pendingFee1,
    setPendingFee0,
    setPendingFee1,
    setCollectFeeSuccess,
    collectFeeSuccess,
  } = useLPStore();

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isApprovedSuccess, setIsApprovedSuccess] = useState(false);

  const [preventClose, setPreventClose] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // const collectHandler = async () => {
  //   setIsCollectLoading(true);
  //   const chainContractConfig: ContractConfigItemType =
  //     contractConfig[chainId!] || contractConfig["default"];
  //   try {
  //     const hash = await writeContract(config, {
  //       address: chainContractConfig.v3PositionManagerAddress as `0x${string}`,
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "collect",
  //       args: [
  //         {
  //           tokenId: data?.id!,
  //           recipient: address as Address,
  //           amount0Max: BigInt("340282366920938463463374607431768211400"),
  //           amount1Max: BigInt("340282366920938463463374607431768211400"),
  //         },
  //       ],
  //       chainId,
  //     });
  //     const transactionReceipt = await waitForTransaction(config, {
  //       hash: hash!,
  //     });
  //     if (transactionReceipt.status === "success") {
  //       // Show success notification
  //       toast.success(
  //         <div>
  //           <p>Fees successfully collected.</p>
  //           <Link
  //             href={`${chainContractConfig.explorerURL}/tx/${transactionReceipt?.transactionHash}`}
  //             target="_blank"
  //             rel="noreferrer"
  //             className="text-slate text-sm underline z-50"
  //           >
  //             View Transaction
  //           </Link>
  //         </div>,
  //         {
  //           toastId: "collect-success-toast",
  //         }
  //       );
  //       setCollectFeeSuccess(true);
  //       setPendingFee0("0.0");
  //       setPendingFee1("0.0");
  //       setIsOpen(true);
  //     }
  //   } catch (error: any) {
  //     console.log("collect rewards error:", error);
  //     toast.error(error?.shortMessage, {
  //       toastId: "collect-rewards-error-toast",
  //     });
  //   } finally {
  //     setIsCollectLoading(false);
  //   }
  // };

  // const approvePositionHandler = async (id: string) => {
  //   setIsLoadingApprove(true);
  //   const chainContractConfig: ContractConfigItemType =
  //     contractConfig[chainId!] || contractConfig["default"];
  //   try {
  //     const hash = await writeContract(config, {
  //       address: chainContractConfig.v3PositionManagerAddress as Address,
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "approve",
  //       args: [chainContractConfig.v3PositionManagerAddress as Address, id], // Approve position manager to handle your LP token
  //     });

  //     const transactionReceipt = await waitForTransaction(config, {
  //       hash: hash!,
  //     });

  //     if (transactionReceipt.status === "success") {
  //       // Show success notification
  //       toast.success(
  //         <div>
  //           <p>Successfully approved</p>
  //           <Link
  //             href={`${chainContractConfig.explorerURL}/tx/${hash}`}
  //             target="_blank"
  //             rel="noreferrer"
  //             className="text-slate text-sm underline"
  //           >
  //             View Transaction
  //           </Link>
  //         </div>,
  //         {
  //           toastId: "swap-success-toast",
  //         }
  //       );
  //       setIsApprovedSuccess(true);
  //     }
  //   } catch (error: any) {
  //     console.error("Approve error", error);
  //     toast.error(error?.shortMessage, {
  //       toastId: "LP-remove-approve-error-toast",
  //     });
  //     if (error.details) console.error("Error Details:", error.details);
  //   } finally {
  //     setIsLoadingApprove(false);
  //   }
  // };

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
            tokenId: dataRow?.id!,
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

        setCollectFeeSuccess(true);
        setPendingFee0("0.0");
        setPendingFee1("0.0");

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

  // useEffect(() => {
  //   if (collectFeeSuccess) {
  //     setPreventClose(true); // Prevent closing immediately
  //     const timeout = setTimeout(() => {
  //       setPreventClose(false); // Allow closing after 2.5s
  //     }, 2500);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [collectFeeSuccess]);

  useEffect(() => {
    if (collectFeeSuccess) {
      // console.log("Collect fee successful");
      setPreventClose(true);
      const timeout = setTimeout(() => {
        // console.log("Timeout finished");
        setPreventClose(false);
      }, 2500);
      return () => {
        // console.log("Cleanup");
        clearTimeout(timeout);
      };
    }
  }, [collectFeeSuccess]);

  useEffect(() => {
    if (!isOpen) {
      console.log("collected");
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex button-primary uppercase w-32 pt-3">
          Collect fees
        </Button>
      </DialogTrigger>
      {/* <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className="bg-[#1a1a1a] border-[2px] right-0 border-[#ffffff14] px-1 sm:p-6 sm:max-w-[425px]"
      > */}
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
              <div className="flex items-center flex-row w-full">
                <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#000] flex items-center justify-center bg-[#000] text-white text-sm font-bold">
                  {getInitials(pairFromToken?.name! ?? "NA")}
                </div>
                <div className="ml-2">{pairFromToken?.symbol!}</div>
              </div>
              <div className="flex">
                <div>
                  {/* {formatUnits(
                    dataRow?.result[8] ?? BigInt("0"),
                    pairFromToken?.decimals!
                  )}{" "} */}
                  {getTrimmedResult(pendingFee0)}
                </div>
                {/* <div className="ml-2 inline-flex">{pairFromToken?.symbol!}</div> */}
              </div>
            </div>
            <div className="flex items-center flex-row w-full">
              <div className="flex items-center flex-row w-full">
                <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#000] flex items-center justify-center bg-[#000] text-white text-sm font-bold">
                  {getInitials(pairToToken?.name! ?? "NA")}
                </div>
                <div className="ml-2">{pairToToken?.symbol!}</div>
              </div>
              <div className="flex">
                <div>
                  {/* {formatUnits(
                    dataRow?.result[9] ?? BigInt("0"),
                    pairToToken?.decimals!
                  )} */}
                  {getTrimmedResult(pendingFee1)}
                </div>
                {/* <div className="ml-2 inline-flex">{pairToToken?.symbol!}</div> */}
              </div>
            </div>
          </div>
          <div className="w-full flex flex-row grow gap-1.5 mt-4">
            {/* {!isApprovedSuccess ? (
              <Button
                onClick={() => approvePositionHandler(data?.id!)}
                className="flex button-primary w-full h-12"
              >
                {" "}
                {isLoadingApprove && (
                  <Loader2 size={20} className="animate-spin" />
                )}
                Approve{" "}
              </Button>
            ) : ( */}
            <Button
              onClick={collectHandler}
              className="flex button-primary w-full h-10 uppercase"
              disabled={
                (parseFloat(pendingFee0) <= 0 &&
                  parseFloat(pendingFee1) <= 0) ||
                isColectLoading
              }
            >
              {isColectLoading && (
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
