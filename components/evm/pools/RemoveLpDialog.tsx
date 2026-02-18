"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, OctagonAlert, Settings } from "lucide-react";
import { useSwapStore } from "@/store/useDexStore";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { waitForTransaction, writeContract } from "@wagmi/core";
import { useAccount, useConfig } from "wagmi";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { Address, encodeFunctionData, formatUnits, parseUnits } from "viem";
import { toast } from "react-toastify";
import Link from "next/link";
import PairTokens from "@/components/evm/pools/PairTokens";
import { useLPStore } from "@/store/useDexStore";
import { getInitials } from "@/lib/utils";

const RemoveLpDialog = () => {
  const { chainId, address } = useAccount();
  const {
    lpSlippage,
    setRemoveLpSuccess,
    removeLpSuccess,
    setPendingFee0,
    setPendingFee1,
    setCollectFeeSuccess,
  } = useLPStore();

  const { dataRow, pairFromToken, pairToToken } = useSwapStore();
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
  const [isColectLoading, setIsCollectLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const ranges = [25, 50, 75, 100];

  const [preventClose, setPreventClose] = useState(true);

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

  // const priceInputHandler = (value: string) => {
  //   let input = value.toString().replace(/[^0-9.%]/g, "");
  //   const val = parseFloat(input) / 100;
  //   console.log("val", val);

  //   console.log("ata?.liquidity", data.liquidity);
  //   const lpValue = val * parseFloat(data?.liquidity!);
  //   const t0Value = val * parseFloat(data?.amount0!);
  //   const t1Value = val * parseFloat(data?.amount1!);
  //   console.log(
  //     "lpValue",
  //     data?.liquidity!,
  //     lpValue,
  //     "t0Value",
  //     data?.amount0!,
  //     t0Value,
  //     "t1Value",
  //     data?.amount1!,
  //     t1Value
  //   );

  //   setLp(lpValue.toString());
  //   setT0(t0Value.toString());
  //   setT1(t1Value.toString());
  //   setActiveValue(input);
  // };

  const priceInputHandler = (value: string) => {
    const input = value.toString().replace(/[^0-9.%]/g, "");
    const percent = parseFloat(input);
    const val = percent / 100;

    if (dataRow?.liquidity) {
      // console.log("data?.liquidity", dataRow?.liquidity);

      const totalLiquidity = BigInt(dataRow?.liquidity! ?? "0");
      const totalt0Value = BigInt(dataRow?.amount0! ?? "0");
      const totalt1Value = BigInt(dataRow?.amount1! ?? "0");
      const formattedSlippage = BigInt(100 - lpSlippage!);

      const lpValue =
        (totalLiquidity * BigInt(Math.floor(val * 100) ?? 0)) / BigInt(100);

      const t0Value =
        ((totalt0Value * BigInt(Math.floor(val * 100))) / BigInt(100)) *
        formattedSlippage;

      const t1Value =
        ((totalt1Value * BigInt(Math.floor(val * 100))) / BigInt(100)) *
        formattedSlippage;

      // const totalLiquidity = parseFloat(data?.liquidity! ?? "0");
      // const totalt0Value = parseFloat(data?.amount0! ?? "0");
      // const totalt1Value = parseFloat(data?.amount1! ?? "0");
      // const formattedSlippage = 100 - lpSlippage!;

      // const lpValue = totalLiquidity * val;

      // const t0Value = (totalt0Value * val * formattedSlippage) / 100;

      // const t1Value = (totalt1Value * val * formattedSlippage) / 100;

      // console.log(
      //   // "t0Value",
      //   // t0Value,
      //   // "t1Value",
      //   // t1Value,
      //   "lpValue",
      //   lpValue,
      //   "full data",
      //   dataRow
      // );

      setLp(lpValue.toString());
      setT0(
        formatUnits(BigInt(t0Value!), dataRow?.token0?.decimal!).toString()
      );
      setT1(
        formatUnits(BigInt(t1Value!), dataRow?.token0?.decimal!).toString()
      );
      setActiveValue(input);
    }
  };

  function toNonExponential(num: number | string): string {
    const n = typeof num === "string" ? parseFloat(num) : num;
    return n.toLocaleString("fullwide", { useGrouping: false });
  }

  const approvePositionHandler = async (id: string) => {
    setIsLoadingApprove(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId!] || contractConfig["default"];
    try {
      const hash = await writeContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as Address,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "approve",
        args: [chainContractConfig.v3PositionManagerAddress as Address, id], // Approve position manager to handle your LP token
      });

      const transactionReceipt = await waitForTransaction(config, {
        hash: hash!,
      });

      if (transactionReceipt.status === "success") {
        // Show success notification
        toast.success(
          <div>
            <p>Successfully approved</p>
            <Link
              href={`${chainContractConfig.explorerURL}/tx/${hash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline"
            >
              View Transaction
            </Link>
          </div>,
          {
            toastId: "swap-success-toast",
          }
        );
        setIsApprovedSuccess(true);
      }
    } catch (error: any) {
      console.error("Approve error", error);
      toast.error(error?.shortMessage, {
        toastId: "LP-remove-approve-error-toast",
      });
      if (error.details) console.error("Error Details:", error.details);
    } finally {
      setIsLoadingApprove(false);
    }
  };

  // const decreaseLiquidityHandler = async () => {
  //   setIsLoadingLpRemove(true);
  //   const chainContractConfig: ContractConfigItemType =
  //     contractConfig[chainId!] || contractConfig["default"];
  //   console.log("datdata", data);
  //   // if (data) {
  //   //   approvePositionManager(data?.id!);
  //   // }

  //   try {
  //     await writeContract(config, {
  //       address: chainContractConfig.v3PositionManagerAddress as `0x${string}`,
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "decreaseLiquidity",
  //       args: [
  //         {
  //           tokenId: data?.id!,
  //           liquidity: lp,
  //           amount0Min: BigInt(1),
  //           amount1Min: BigInt(1),
  //           deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 10),
  //         },
  //       ],
  //       chainId,
  //     });
  //   } catch (error) {
  //     console.log("Remove liquidity error", error);
  //   } finally {
  //     setIsLoadingLpRemove(false);
  //   }
  // };

  // const decreaseLiquidityHandler = async () => {
  //   setIsCollectLoading(true);
  //   setIsLoadingLpRemove(true);
  //   const chainContractConfig: ContractConfigItemType =
  //     contractConfig[chainId!] || contractConfig["default"];

  //   if (!dataRow?.id) {
  //     console.error("Token ID is missing");
  //     setIsLoadingLpRemove(false);
  //     return;
  //   }

  //   if (!lp || parseFloat(lp) <= 0) {
  //     console.error("Invalid liquidity value");
  //     setIsLoadingLpRemove(false);
  //     return;
  //   }

  //   // console.log("Removing Liquidity for Token ID:", dataRow.id, lp);

  //   try {
  //     // Ensure approval before decreasing liquidity
  //     // await approvePositionManager(data.id);

  //     const hash = await writeContract(config, {
  //       address: chainContractConfig.v3PositionManagerAddress as `0x${string}`,
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "decreaseLiquidity",
  //       args: [
  //         {
  //           tokenId: dataRow?.id!,
  //           liquidity: lp,
  //           amount0Min: BigInt("0"), //t0, //BigInt("0"), //BigInt(toNonExponential(t0)),
  //           amount1Min: BigInt("0"), //t1, //BigInt("0"), //BigInt(toNonExponential(t1)),
  //           deadline: Math.floor(Date.now() / 1000) + 60 * 10,
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
  //           <p>Successfully removed liquidity</p>
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
  //           toastId: "swap-success-toast",
  //         }
  //       );
  //       setPendingFee0("0.0");
  //       setPendingFee1("0.0");
  //       collectHandler();
  //       // setIsApprovedSuccess(true);
  //     }
  //     // console.log("Liquidity removed successfully", transactionReceipt);
  //   } catch (error: any) {
  //     console.error("Remove liquidity error", error);
  //     toast.error(error?.shortMessage, {
  //       toastId: "LP-remove-error-toast",
  //     });
  //     if (error.details) console.error("Error Details:", error.details);
  //   } finally {
  //     setIsLoadingLpRemove(false);
  //   }
  // };

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
  //           tokenId: dataRow?.id!,
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
  //       setIsOpen(false);
  //       // Show success notification
  //       toast.success(
  //         <div>
  //           <p>Tokens successfully collected.</p>
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
  //       setRemoveLpSuccess(true);
  //       setT1("0.0");
  //       setT0("0.0");
  //       setPendingFee0("0.0");
  //       setPendingFee1("0.0");
  //     }
  //   } catch (error: any) {
  //     console.error("collect rewards error:", error);
  //     toast.error(error?.shortMessage, {
  //       toastId: "collect-rewards-error-toast",
  //     });
  //   } finally {
  //     setIsCollectLoading(false);
  //   }
  // };

  // const WRAPPED_NATIVE: Record<number, `0x${string}`> = {
  //   1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH Ethereum
  //   56: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB BSC
  //   8453: "0x4200000000000000000000000000000000000006", // WETH Base
  // };

  const removeAndCollectHandler = async () => {
    setIsCollectLoading(true);
    setIsLoadingLpRemove(true);

    try {
      const chainCfg = contractConfig[chainId!] || contractConfig["default"];
      if (!dataRow?.id) throw new Error("Token ID missing");
      if (!lp || parseFloat(lp) <= 0) throw new Error("Invalid liquidity");

      const calls: `0x${string}`[] = [];

      // ---- decreaseLiquidity
      const decreaseLiquidityData = encodeFunctionData({
        abi: chainCfg.v3PositionManagerABI,
        functionName: "decreaseLiquidity",
        args: [
          {
            tokenId: dataRow.id,
            liquidity: lp,
            amount0Min: BigInt("0"),
            amount1Min: BigInt("0"),
            deadline: Math.floor(Date.now() / 1000) + 600,
          },
        ],
      });
      calls.push(decreaseLiquidityData);

      // ---- collect
      const collectData = encodeFunctionData({
        abi: chainCfg.v3PositionManagerABI,
        functionName: "collect",
        args: [
          {
            tokenId: dataRow.id,
            recipient: address!,
            amount0Max: BigInt("340282366920938463463374607431768211400"),
            amount1Max: BigInt("340282366920938463463374607431768211400"),
          },
        ],
      });
      calls.push(collectData);

      // ---- multicall
      const hash = await writeContract(config, {
        address: chainCfg.v3PositionManagerAddress as Address,
        abi: chainCfg.v3PositionManagerABI,
        functionName: "multicall",
        args: [calls],
        chainId,
      });

      const receipt = await waitForTransaction(config, { hash });
      if (receipt.status === "success") {
        toast.success("Successfully removed liquidity.", {
          toastId: "remove-collect-success",
        });
        setT0("0.0");
        setT1("0.0");
        setPendingFee0("0.0");
        setPendingFee1("0.0");
        setRemoveLpSuccess(true);
        setCollectFeeSuccess(true);
        setIsOpen(false);
      }
    } catch (err: any) {
      console.error("Remove/collect error", err);
      toast.error(err?.shortMessage ?? "Transaction failed", {
        toastId: "remove-collect-error",
      });
    } finally {
      setIsCollectLoading(false);
      setIsLoadingLpRemove(false);
    }
  };

  // const removeAndCollectHandler = async () => {
  //   setIsCollectLoading(true);
  //   setIsLoadingLpRemove(true);

  //   const chainContractConfig: ContractConfigItemType =
  //     contractConfig[chainId!] || contractConfig["default"];

  //   if (!dataRow?.id) {
  //     console.error("Token ID is missing");
  //     setIsLoadingLpRemove(false);
  //     return;
  //   }

  //   if (!lp || parseFloat(lp) <= 0) {
  //     console.error("Invalid liquidity value");
  //     setIsLoadingLpRemove(false);
  //     return;
  //   }

  //   try {
  //     // 1️⃣ Prepare calldata
  //     const decreaseLiquidityData = encodeFunctionData({
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "decreaseLiquidity",
  //       args: [
  //         {
  //           tokenId: dataRow.id,
  //           liquidity: lp,
  //           amount0Min: BigInt(0),
  //           amount1Min: BigInt(0),
  //           deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  //         },
  //       ],
  //     });

  //     const collectData = encodeFunctionData({
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "collect",
  //       args: [
  //         {
  //           tokenId: dataRow.id,
  //           recipient: address as Address,
  //           amount0Max: BigInt("340282366920938463463374607431768211400"),
  //           amount1Max: BigInt("340282366920938463463374607431768211400"),
  //         },
  //       ],
  //     });

  //     // 2️⃣ Call multicall with both
  //     const hash = await writeContract(config, {
  //       address: chainContractConfig.v3PositionManagerAddress as `0x${string}`,
  //       abi: chainContractConfig.v3PositionManagerABI,
  //       functionName: "multicall",
  //       args: [[decreaseLiquidityData, collectData]],
  //       chainId,
  //     });

  //     const tx = await waitForTransaction(config, { hash });

  //     if (tx.status === "success") {
  //       toast.success(
  //         <div>
  //           <p>Liquidity removed & fees collected successfully.</p>
  //           <Link
  //             href={`${chainContractConfig.explorerURL}/tx/${tx.transactionHash}`}
  //             target="_blank"
  //             rel="noreferrer"
  //             className="text-slate text-sm underline"
  //           >
  //             View Transaction
  //           </Link>
  //         </div>,
  //         { toastId: "remove-collect-success" }
  //       );

  //       // Reset local states
  //       setPendingFee0("0.0");
  //       setPendingFee1("0.0");
  //       setT0("0.0");
  //       setT1("0.0");
  //       setCollectFeeSuccess(true);
  //       setRemoveLpSuccess(true);
  //       setIsOpen(false);
  //     }
  //   } catch (error: any) {
  //     console.error("Multicall error:", error);
  //     toast.error(error?.shortMessage ?? "Transaction failed", {
  //       toastId: "multicall-error",
  //     });
  //   } finally {
  //     setIsCollectLoading(false);
  //     setIsLoadingLpRemove(false);
  //   }
  // };

  useEffect(() => {
    if (removeLpSuccess) {
      setPreventClose(false);
      const timeout = setTimeout(() => {
        setPreventClose(true); // allow closing after 3 seconds
      }, 2500);

      return () => clearTimeout(timeout);
    }
  }, [removeLpSuccess]);
  // Reset states when dialog closes

  useEffect(() => {
    if (!isOpen) {
      setActiveValue("");
      setLp("0");
      setT0("");
      setT1("");
      setIsApprovedSuccess(false);
      setRemoveLpSuccess(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          // onClick={() => {
          //   setOpen(true);
          // }}
          className="flex button-primary uppercase w-32 pt-3"
        >
          Remove liquidity
        </Button>
      </DialogTrigger>

      {/* <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        className="bg-[#1a1a1a] border-[2px] right-0 border-[#ffffff14] px-1 sm:p-6 sm:max-w-[425px]"
      > */}

      {/* <DialogContent
        // modal={false}
        onInteractOutside={(event) => {
          // Prevent closing when clicking outside but allow interaction with overlays like toast
          if (!removeLpSuccess) {
            event.preventDefault();
            
          }
        }}
        
      > */}

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
            <div className="text-[16px] font-medium sm:font-semibold text-left text-primary">
              Remove liquidity
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          <div className="mb-4">
            <PairTokens />
          </div>
          {dataRow?.tokenLocked! && (
            <div className="py-4 flex gap-2 rounded-xl border-none  text-red-500  text-start items-start text-xs">
              <OctagonAlert className="!h-[16px] !w-[16px] shrink-0 mt-0.5" />
              <span>
                You cannot remove your liquidity until it is unlocked.
              </span>
            </div>
          )}
          {/* <div
            className={`flex flex-row items-center w-full ring-2 ring-[#ffffff14] ring-inset grow px-2 py-2 rounded-[12px] h-20 text-center justify-center`}
          >
            <input
              type="text"
              placeholder="0.0"
              className="w-fit flex justify-center text-3xl font-bold focus:outline-none bg-transparent items-center text-right !ring-0 !border-none"
              value={activeValue}
              onChange={(e) => priceInputHandler(e.target.value)}
            />
            <span className="ml-[1px] text-3xl font-bold items-center">%</span>
          </div> */}
          <div className="flex items-center justify-center w-full ring-2 ring-[#00000014] dark:ring-[#ffffff14] ring-inset px-2 py-2 rounded-[12px] h-20 text-center">
            {/* <div className="flex items-center justify-center gap-1">
              <input
                type="text"
                placeholder="0.0"
                className={`${
                  activeValue === "100" ? "w-[85px]" : "w-full"
                } text-[#ffffffb3] w-full text-5xl font-bold text-center bg-transparent focus:outline-none !ring-0 !border-none`}
                value={activeValue}
                onChange={(e) => priceInputHandler(e.target.value)}
              />
              <span className="text-5xl text-[#ffffffb3] font-bold">%</span>
            </div> */}
            <div className="flex items-center gap-1">
              <div className="inline-flex items-center">
                <input
                  type="text"
                  placeholder="0.0"
                  className="min-w-[50px] w-full max-w-[130px] dark:text-[#ffffffb3] text-5xl font-bold text-right bg-transparent focus:outline-none !ring-0 !border-none"
                  value={activeValue}
                  onChange={(e) => priceInputHandler(e.target.value)}
                />
                <span className="text-5xl dark:text-[#ffffffb3] font-bold">
                  %
                </span>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row grow gap-1.5 mt-4">
            {ranges.map((range, index) => (
              <div
                key={index}
                className="flex flex-row grow items-center justify-center"
              >
                {range === 100 ? (
                  <div
                    onClick={() => priceInputHandler(range.toString())}
                    className={`flex justify-center text-sm font-bold grow w-10 border-2 border-primary rounded-[12px] bg-transparent hover:bg-primary hover:text-black items-center py-2 px-2 hover:cursor-pointer ${
                      activeValue === range.toString()
                        ? "!bg-primary !text-black"
                        : "ring-primary"
                    }`}
                  >
                    Max
                  </div>
                ) : (
                  <div
                    onClick={() => priceInputHandler(range.toString())}
                    className={`flex justify-center text-sm font-bold grow w-10 border-2 border-primary rounded-[12px] bg-transparent hover:bg-primary hover:text-black items-center py-2 px-2 hover:cursor-pointer ${
                      activeValue === range.toString()
                        ? "!bg-primary !text-black"
                        : "ring-primary"
                    }`}
                  >
                    {range}%
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* <div className="w-full flex flex-row grow gap-1.5 mt-4">
            {ranges.map((range, index) => (
              <div
                key={index}
                className="flex flex-row grow items-center justify-center"
              >
                {range === 100 ? (
                  <div
                    onClick={() =>
                      data?.liquidity
                        ? priceInputHandler(range.toString())
                        : null
                    }
                    className={`flex justify-center text-sm font-bold grow w-10 border-2 rounded-[12px] items-center py-2 px-2 
            ${
              !data?.liquidity
                ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
                : `border-primary bg-transparent hover:bg-primary hover:text-black hover:cursor-pointer ${
                    activeValue === range.toString()
                      ? "!bg-primary !text-black"
                      : "ring-primary"
                  }`
            }`}
                  >
                    {!data?.liquidity ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      "Max"
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() =>
                      data?.liquidity
                        ? priceInputHandler(range.toString())
                        : null
                    }
                    className={`flex justify-center text-sm font-bold grow w-10 border-2 rounded-[12px] items-center py-2 px-2 
            ${
              !data?.liquidity
                ? "bg-gray-300 text-gray-500 cursor-not-allowed border-gray-300"
                : `border-primary bg-transparent hover:bg-primary hover:text-black hover:cursor-pointer ${
                    activeValue === range.toString()
                      ? "!bg-primary !text-black"
                      : "ring-primary"
                  }`
            }`}
                  >
                    {!data?.liquidity ? (
                      <span className="animate-pulse">Loading...</span>
                    ) : (
                      `${range}%`
                    )}
                  </div>
                )}
              </div>
            ))}
          </div> */}

          {/* <div className="my-4 flex flex-col w-full border-[2px] p-2 dark:border-[#ffffff14] rounded-xl space-y-2">
            <div className="flex items-center flex-row w-full">
              <div className="flex items-center flex-row w-full">
                <div className="rounded-full w-[35px] h-[35px] border-[2px] border-[#000] flex items-center justify-center bg-[#000] text-white text-sm font-bold">
                  {getInitials(pairFromToken?.name! ?? "NA")}
                </div>
                <div className="ml-2">{pairFromToken?.symbol!}</div>
              </div>
              <div className="flex">
                <div className="dark:text-[#ffffff37]">
                  {getTrimmedResult(t0!)}
                </div>
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
                <div className="dark:text-[#ffffff37]">
                  {getTrimmedResult(t1!)}
                </div>
              </div>
            </div>
          </div> */}
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
            {/* {removeLpSuccess ? (
              <Button
                onClick={collectHandler}
                className="flex button-primary uppercase w-full h-10"
                disabled={parseFloat(lp) <= 0 || isLoadingLpRemove}
              >
                {" "}
                {isLoadingLpRemove && (
                  <Loader2 size={20} className="animate-spin" />
                )}
                Collect Tokens
              </Button>
            ) : ( */}
            <Button
              onClick={removeAndCollectHandler}
              className="flex button-primary uppercase w-full h-10"
              disabled={
                parseFloat(lp) <= 0 ||
                isLoadingLpRemove ||
                isColectLoading ||
                dataRow?.tokenLocked!
              }
            >
              {" "}
              {(isLoadingLpRemove || isColectLoading) && (
                <Loader2 size={20} className="animate-spin" />
              )}
              Remove{" "}
            </Button>
            {/* )} */}

            {/* )} */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveLpDialog;
