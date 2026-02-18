"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Settings } from "lucide-react";
import { useSwapStore } from "@/store/useDexStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { waitForTransaction, writeContract } from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { Address, formatUnits, parseUnits } from "viem";
import { toast } from "react-toastify";
import Link from "next/link";
import { useLPStore } from "@/store/useDexStore";
import IncreaseTokenBalanceTop from "@/components/evm/pools/IncreaseTokenBalanceTop";
import IncreaseTokenBalanceBottom from "@/components/evm/pools/IncreaseTokenBalanceBottom";

interface TransactionsProps {
  id: string;
}

const IncreaseLpDialog = ({ id }: TransactionsProps) => {
  const { chainId, address } = useAccount();
  const {
    lpSlippage,
    setRemoveLpSuccess,
    setCollectFeeSuccess,
    removeLpSuccess,
    fromLPTokenInputAmount,
    toLPTokenInputAmount,
    fromLPToken,
    toLPToken,
    setFromLPToken,
    setToLPToken,
    setPoolFee,
    setIncreasePairRatio,
  } = useLPStore();
  const {
    pairFromToken,
    pairToToken,
    singleDataRow,
    dataRow,
    setFromToken,
    setToToken,
    setFeeTier,
    defaultTab,
  } = useSwapStore();
  // const publicClient = usePublicClient();
  // const { data: signer } = useWalletClient();
  const config = useConfig();
  const [activeValue, setActiveValue] = useState("");
  const [lp, setLp] = useState("0");
  const [t0, setT0] = useState("");
  const [t1, setT1] = useState("");

  const [isLoadingApprove, setIsLoadingApprove] = useState(false);
  const [isApprovedSuccess, setIsApprovedSuccess] = useState(false);
  const [isLoadingLpRemove, setIsLoadingLpRemove] = useState(false);
  const [open, setOpen] = useState(false);

  const ranges = [25, 50, 75, 100];

  const [preventClose, setPreventClose] = useState(true);

  const amount0 = parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!);
  const amount1 = parseUnits(toLPTokenInputAmount, toLPToken?.decimals!);

  const increaseLiquidityHandler = async () => {
    setIsLoadingLpRemove(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];

    try {
      // Ensure approval before decreasing liquidity
      // await approvePositionManager(data.id);

      const token0AmountMinMulticall = (amount0 * BigInt(5)) / BigInt(10); // 50% of amount0
      const token1AmountMinMulticall = (amount1 * BigInt(5)) / BigInt(10); // 50% of amount1

      const hash = await writeContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as `0x${string}`,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "increaseLiquidity",
        args: [
          {
            tokenId: id!,
            amount0Desired: amount0,
            amount1Desired: amount1,
            amount0Min: token0AmountMinMulticall,
            amount1Min: token1AmountMinMulticall,
            deadline: Math.floor(Date.now() / 1000) + 60 * 10,
          },
        ],
        chainId,
      });
      const transactionReceipt = await waitForTransaction(config, {
        hash: hash!,
      });

      if (transactionReceipt.status === "success") {
        // Show success notification
        toast.success(
          <div>
            <p>Successfully added liquidity</p>
            <Link
              href={`${chainContractConfig.explorerURL}/tx/${transactionReceipt?.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline z-50"
            >
              View Transaction
            </Link>
          </div>,
          {
            toastId: "swap-success-toast",
          }
        );
        setRemoveLpSuccess(true);
        setCollectFeeSuccess(true);
        setTimeout(() => setOpen(false), 2000);
        // setIsApprovedSuccess(true);
      }
      console.log("Liquidity added successfully", transactionReceipt);
    } catch (error: any) {
      console.error("add liquidity error", error);
      toast.error(error?.shortMessage, {
        toastId: "LP-added-error-toast",
      });
      if (error.details) console.error("Error Details:", error.details);
    } finally {
      setIsLoadingLpRemove(false);
    }
  };

  useEffect(() => {
    if (removeLpSuccess) {
      setPreventClose(false);
      const timeout = setTimeout(() => {
        setPreventClose(true); // allow closing after 3 seconds
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [removeLpSuccess]);

  const addLiquidityPoolHandler = () => {
    // console.log("pairFromToken", pairFromToken);
    // console.log("pairToToken", pairToToken);
    // console.log("pair feetier", dataRow.result[4]);
    // console.log("pair dataRow", dataRow);
    const pairRatio =
      parseFloat(
        formatUnits(dataRow?.amount1.toString(), pairToToken.decimals)
      ) /
      parseFloat(
        formatUnits(dataRow?.amount0.toString(), pairFromToken.decimals)
      );
    console.log("pair ratio", pairRatio);
    setFromLPToken(pairFromToken);
    setToLPToken(pairToToken);
    setPoolFee(dataRow.result[4]);
    setIncreasePairRatio(pairRatio);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={addLiquidityPoolHandler}
          //   className="w-1/2 button-primary inline-flex justify-center items-center uppercase"
          className="w-1/2 button-primary inline-flex justify-center items-center uppercase pt-3"
        >
          {/* {isLoading && <Loader2 size={20} className="animate-spin" />} */}
          {/* <Plus className="button-primary" /> Add liquidity */}
          <Plus className="button-primary -mt-1" /> Add liquidity
        </Button>
      </DialogTrigger>

      <DialogContent
        onInteractOutside={(event) => {
          if (preventClose) {
            event.preventDefault();
          }
        }}
        className="card-primary  border-[2px] right-0  px-1 sm:p-6 "
      >
        <DialogHeader>
          <DialogTitle>
            <div className="text-[16px] font-medium sm:font-semibold text-left">
              Add liquidity
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          {/* <div className="mb-4">
            <PairTokens />
          </div> */}
          <div className="flex flex-col w-full ">
            <div className="flex flex-col justify-start">
              <div className="uppercase  dark:text-[#ffffff] text-base !font-barlow font-semibold">
                Deposit Amount
              </div>
              <p className="text-sm text-neutral-400 font-lato font-normal">
                Specify the token amounts for your liquidity contribution.
              </p>
            </div>

            <div className="flex flex-col w-full pt-1">
              <IncreaseTokenBalanceTop />
              <IncreaseTokenBalanceBottom />
              <div className="pt-3">
                <div className="w-full flex flex-row grow gap-1.5 mt-4">
                  <Button
                    onClick={increaseLiquidityHandler}
                    className="flex button-primary uppercase w-full h-10"
                    //   disabled={parseFloat(lp) <= 0 || isLoadingLpRemove}
                  >
                    {" "}
                    {isLoadingLpRemove && (
                      <Loader2 size={20} className="animate-spin" />
                    )}
                    Add Liquidity{" "}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IncreaseLpDialog;
