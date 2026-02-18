"use client";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useLPStore } from "@/store/useDexStore";
import { useAccount, useConfig, usePublicClient, useWalletClient } from "wagmi";
import { ContractConfigItemType, TokenType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import {
Address,
encodeFunctionData,
erc20Abi,
formatUnits,
parseUnits,
} from "viem";
import { toast } from "react-toastify";
import {
sendTransaction,
waitForTransaction,
writeContract,
} from "@wagmi/core";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { BigNumber } from "ethers";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { checkLpApproveAllowance } from "@/service/blockchain.service";

const AddLPButton = () => {
const config = useConfig();
const {
fromLPToken,
toLPToken,
fromLPTokenInputAmount,
toLPTokenInputAmount,
tickLower,
tickUpper,
feeTier,
sqrtPriceX96,
poolAddress,
token0Address,
poolFee,
setFromLpTokenApprovedAmount,
fromLpTokenApprovedAmount,
setToLpTokenApprovedAmount,
toLpTokenApprovedAmount,
fromLPTokenBalance,
toLPTokenBalance,
tickSpace,
activePriceRange,
setFromLPTokenInputAmount,
setToLPTokenInputAmount,
setFromLPTokenBalance,
setToLPTokenBalance,
} = useLPStore();
const { address, chainId } = useAccount();
const { data: signer } = useWalletClient();
const publicClient = usePublicClient();
const [isLoading, setIsLoading] = useState(false);
const [isLoadingApprove, setIsLoadingApprove] = useState(false);
const [isLoadingFetchApprovedAmount, setIsLoadingFetchApprovedAmount] =
useState(false);

const addLiquidity2 = async () => {
setIsLoading(true);
if (!signer || !address) {
console.error("Wallet not connected");
return;
}
const chainContractConfig: ContractConfigItemType =
contractConfig[chainId!] || contractConfig["default"];

    const positionManager = chainContractConfig.v3PositionManagerAddress;
    const slippageBuffer = (value: number) => {
      return 0.9 * value;
    };

    console.log("existing pool token0Address", token0Address);
    console.log(
      "wish fromLPToken?.address",
      fromLPToken?.address,
      "token0Address",
      token0Address
    );

    const token0 =
      fromLPToken?.address?.toLowerCase() === token0Address?.toLowerCase()
        ? fromLPToken?.address
        : toLPToken?.address;

    const token00 = token0 as Address;

    const token1 =
      fromLPToken?.address?.toLowerCase() === token0Address?.toLowerCase()
        ? toLPToken?.address
        : fromLPToken?.address;

    const token11 = token1 as Address;

    console.log("token00,token11", token00, token11);

    // const token0Multicall = fromLPToken?.address;

    // const token1Multicall = toLPToken?.address;

    const [token0Multicall, token1Multicall] =
      fromLPToken?.address.toLowerCase()! < toLPToken?.address.toLowerCase()!
        ? [fromLPToken?.address, toLPToken?.address]
        : [toLPToken?.address, fromLPToken?.address];

    const token0AmountMulticall =
      token0Multicall?.toLowerCase() === fromLPToken?.address.toLowerCase()!
        ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
        : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!);

    const token1AmountMulticall =
      token1Multicall?.toLowerCase() === toLPToken?.address.toLowerCase()!
        ? parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
        : parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!);

    const token0AmountMinMulticall = parseUnits(
      slippageBuffer(parseFloat(fromLPTokenInputAmount)).toString(),
      fromLPToken?.decimals!
    );
    const token1AmountMinMulticall = parseUnits(
      slippageBuffer(parseFloat(toLPTokenInputAmount)).toString(),
      toLPToken?.decimals!
    );

    // const token0 = fromLPToken?.address!;
    // const token1 = toLPToken?.address!;

    const amount0 =
      fromLPToken?.address === token0Address
        ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
        : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!); // 1 token with 18 decimals
    const amount1 =
      fromLPToken?.address === token0Address
        ? parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
        : parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!);

    const amount0Min =
      fromLPToken?.address === token0Address
        ? parseUnits(
            slippageBuffer(parseFloat(fromLPTokenInputAmount)).toString(),
            fromLPToken?.decimals!
          )
        : parseUnits(
            slippageBuffer(parseFloat(toLPTokenInputAmount)).toString(),
            toLPToken?.decimals!
          );
    const amount1Min =
      fromLPToken?.address === token0Address
        ? parseUnits(
            slippageBuffer(parseFloat(toLPTokenInputAmount)).toString(),
            toLPToken?.decimals!
          )
        : parseUnits(
            slippageBuffer(parseFloat(fromLPTokenInputAmount)).toString(),
            fromLPToken?.decimals!
          );
    console.log("fee now", feeTier);

    const fee = parseFloat(feeTier) * 10000;

    console.log(
      "wish inputs",
      token0,
      token1,
      fee,
      sqrtPriceX96,
      amount0,
      amount1,
      amount0Min,
      amount1Min
      // tickLower,
      // tickUpper
    );

    // const tickLower = -95979; // Example ticks
    // const tickUpper = -95779;
    // const fee = parseFloat(feeTier);

    // console.log("tickLower", "tickUpper", tickLower, tickUpper);

    const deadline = Math.floor(Date.now() / 1000) + 1200; // 10 min deadline

    // Encode approval calls (if required)
    // const approveToken0 = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: "approve",
    //   args: [positionManager as Address, amount0],
    // });
    // console.log("approveToken0", approveToken0);
    // const approveToken1 = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: "approve",
    //   args: [positionManager as Address, amount1],
    // });
    // console.log("approveToken1", approveToken1);

    console.log("positionManager", positionManager);

    function alignToTickSpacing(tick: number, tickSpacing: number) {
      return Math.round(tick / tickSpacing) * tickSpacing;
    }
    function priceToTick(price: number) {
      if (price < 1e-20) {
        return (
          Math.floor(Math.log(price * 1e20) / Math.log(1.0001)) -
          Math.floor(Math.log(1e20) / Math.log(1.0001))
        );
      }
      return Math.floor(Math.log(price) / Math.log(1.0001));
    }
    const currentPrice = parseFloat(toLPTokenInputAmount);
    const tickLow = alignToTickSpacing(
      priceToTick(currentPrice - currentPrice * activePriceRange),
      tickSpace
    );
    const tickHigh = alignToTickSpacing(
      priceToTick(currentPrice + currentPrice * activePriceRange),
      tickSpace
    );
    // let tickL = -10;
    // let tickH = 10;

    // console.log("tickL", "tickH", tickL, tickH);
    // const tickhigher = tickUpper! * 2;
    console.log("tickLower", "tickUpper", tickLower, tickUpper);
    // Encode mint function call

    const mintLiquidity = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "mint",
      args: [
        {
          token0: token00,
          token1: token11,
          fee,
          tickLower,
          tickUpper,
          amount0Desired: amount0,
          amount1Desired: amount1,
          amount0Min: amount0Min, //BigInt("0"), //token0AmountMinMulticall,
          amount1Min: amount1Min, // BigInt("0"), //token1AmountMinMulticall,
          recipient: address,
          deadline,
        },
      ],
    });

    // Encode mint function call
    const MulticallMintLiquidity = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "mint",
      args: [
        {
          token0: token0Multicall as Address,
          token1: token1Multicall as Address,
          fee,
          tickLower,
          tickUpper,
          amount0Desired: token0AmountMulticall,
          amount1Desired: token1AmountMulticall,
          amount0Min: token0AmountMinMulticall, //BigInt("0"), //token0AmountMinMulticall,      // amount0Min: token0AmountMinMulticall,
          amount1Min: token1AmountMinMulticall, //BigInt("0"), //token1AmountMinMulticall,  // amount1Min: token1AmountMinMulticall,
          recipient: address,
          deadline,
        },
      ],
    });

    // let sqrt = 0;
    // // Initialize pool
    // if (sqrtPriceX96) {
    //   sqrt = sqrtPriceX96;
    // }

    // const sqrtPriceX96BN = BigNumber.from(sqrtPriceX96?.toString()); // Convert string to BigNumber
    const sqrtPriceX96BN = BigInt(sqrtPriceX96?.toString()!);
    console.log("Converted sqrtPriceX96:", sqrtPriceX96BN.toString());
    // const sq = 5602227458406790178576715587;

    // testPoolCreating

    const testPoolCreating = await writeContract(config, {
      address: chainContractConfig.v3PositionManagerAddress as Address,
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "createAndInitializePoolIfNecessary",
      args: [
        token0Multicall as Address,
        token1Multicall as Address,
        fee,
        sqrtPriceX96BN,
      ],
      chainId,
    });

    const txWaitPoolCreating = await waitForTransaction(config, {
      hash: testPoolCreating,
    });

    console.log("txWaitPoolCreating", txWaitPoolCreating);

    // try {
    //   const testMint = await writeContract(config, {
    //     address: chainContractConfig.v3PositionManagerAddress as Address,
    //     abi: chainContractConfig.v3PositionManagerABI,
    //     functionName: "mint",
    //     args: [
    //       {
    //         token0: token0Multicall as Address,
    //         token1: token1Multicall as Address,
    //         fee,
    //         tickLower: tickL ?? 0,
    //         tickUpper: tickH ?? 0,
    //         amount0Desired: token0AmountMulticall,
    //         amount1Desired: token1AmountMulticall,
    //         amount0Min: BigInt("0"), //token0AmountMinMulticall,
    //         amount1Min: BigInt("0"), //token1AmountMinMulticall,
    //         recipient: address,
    //         deadline,
    //       },
    //     ],
    //   });

    //   const txWaitMint = await waitForTransaction(config, {
    //     hash: testMint,
    //   });

    //   console.log("txWaitMint", txWaitMint);
    // } catch (error) {
    //   console.error("txWaitMint error", error);
    // } finally {
    //   setIsLoading(false);
    // }

    const initialsPoolsNecessary = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "createAndInitializePoolIfNecessary",
      args: [token0Multicall, token1Multicall, fee, sqrtPriceX96BN],
    });

    // Prepare multicall
    const multicallData = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "multicall",
      args: [[initialsPoolsNecessary, MulticallMintLiquidity]],
    });

    // Prepare transaction parameters

    if (poolAddress && fee === poolFee) {
      console.log("mintLiquidity");

      try {
        const tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: mintLiquidity,
          gasLimit: 500000,
        });

        console.log("mint Transaction sent:", tx);
        const transactionReceipt =
          await publicClient!.waitForTransactionReceipt({
            hash: tx,
          });

        if (!transactionReceipt || transactionReceipt.status === "reverted") {
          toast.error("Transaction reverted");
          return;
        }

        console.log("Transaction Receipt:", transactionReceipt);
        console.log(
          "Transaction transactionHash:",
          transactionReceipt.transactionHash
        );
        console.log(
          "Transaction explorerURL:",
          chainContractConfig.explorerURL
        );
        if (transactionReceipt.status === "success") {
          // Show success notification
          toast.success(
            <div>
              {/* <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
              </p> */}
              <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
              </p>
              <Link
                href={`${
                  chainContractConfig.explorerURL
                }/tx/${transactionReceipt?.transactionHash!}`}
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
          setFromLPTokenInputAmount("");
          setToLPTokenInputAmount("");
          let newBalanceFrom =
            parseFloat(fromLPTokenBalance) - parseFloat(fromLPTokenInputAmount);
          let newBalanceTo =
            parseFloat(toLPTokenBalance) - parseFloat(toLPTokenInputAmount);
          setFromLPTokenBalance(newBalanceFrom.toString());
          setToLPTokenBalance(newBalanceTo.toString());
        }
      } catch (error: any) {
        console.error("Error adding liquidity:", error);
        console.log("Full error:", JSON.stringify(error, null, 2));
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-error-toast",
        });
      } finally {
        setIsLoading(false);
      }
      console.log("mintLiquidity", mintLiquidity);
    } else {
      console.log("multicall");

      try {
        // try {
        //   const tx1 = await signer.sendTransaction({
        //     to: positionManager as Address,
        //     data: initialsPoolsNecessary,
        //     gasLimit: 500000,
        //   });

        //   await publicClient!.waitForTransactionReceipt({
        //     hash: initialsPoolsNecessary,
        //   });
        //   console.log("Pool initialized successfully:", tx1);
        // } catch (error) {
        //   console.log("Pool initialized ", error);
        // }
        //  const transactionHash = await sendTransaction(config, transactionParams);
        const tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: multicallData,
          gasLimit: 5000000,
        });

        console.log("Transaction sent:", tx);
        // await publicClient!.waitForTransactionReceipt({ hash: tx });
        console.log("Liquidity added successfully!");

        const transactionReceipt =
          await publicClient!.waitForTransactionReceipt({
            hash: tx,
          });

        if (!transactionReceipt || transactionReceipt.status === "reverted") {
          toast.error("Transaction reverted");
          return;
        }

        // console.log("Transaction Receipt:", transactionReceipt);
        // console.log(
        //   "Transaction transactionHash:",
        //   transactionReceipt.transactionHash
        // );
        // console.log(
        //   "Transaction explorerURL:",
        //   chainContractConfig.explorerURL
        // );
        if (transactionReceipt.status === "success") {
          // Show success notification
          toast.success(
            <div>
              {/* <p>
                Successfully added liquidity:{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and
                {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}.
              </p> */}
              <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
              </p>
              <Link
                href={`${
                  chainContractConfig.explorerURL
                }/tx/${transactionReceipt?.transactionHash!}`}
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
          setFromLPTokenInputAmount("");
          setToLPTokenInputAmount("");
          let newBalanceFrom =
            parseFloat(fromLPTokenBalance) - parseFloat(fromLPTokenInputAmount);
          let newBalanceTo =
            parseFloat(toLPTokenBalance) - parseFloat(toLPTokenInputAmount);
          setFromLPTokenBalance(newBalanceFrom.toString());
          setToLPTokenBalance(newBalanceTo.toString());
        }
      } catch (error: any) {
        console.error("Error adding liquidity:", error);
        console.log("Full error:", JSON.stringify(error, null, 2));
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-error-toast",
        });
      } finally {
        setIsLoading(false);
      }
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

const addLiquidity = async () => {
setIsLoading(true);
if (!signer || !address) {
console.error("Wallet not connected");
return;
}
const chainContractConfig: ContractConfigItemType =
contractConfig[chainId!] || contractConfig["default"];

    const positionManager = chainContractConfig.v3PositionManagerAddress;
    const slippageBuffer = (value: number) => {
      return 0.9 * value;
    };

    console.log("existing pool token0Address", token0Address);
    console.log(
      "wish fromLPToken?.address",
      fromLPToken?.address,
      "token0Address",
      token0Address
    );

    const token0 =
      fromLPToken?.address?.toLowerCase() === token0Address?.toLowerCase()
        ? fromLPToken?.address
        : toLPToken?.address;

    const token00 = token0 as Address;

    const token1 =
      fromLPToken?.address?.toLowerCase() === token0Address?.toLowerCase()
        ? toLPToken?.address
        : fromLPToken?.address;

    const token11 = token1 as Address;

    console.log("token00,token11", token00, token11);

    // const token0Multicall = fromLPToken?.address;

    // const token1Multicall = toLPToken?.address;

    const [token0Multicall, token1Multicall] =
      fromLPToken?.address.toLowerCase()! < toLPToken?.address.toLowerCase()!
        ? [fromLPToken?.address, toLPToken?.address]
        : [toLPToken?.address, fromLPToken?.address];

    const token0AmountMulticall =
      token0Multicall?.toLowerCase() === fromLPToken?.address.toLowerCase()!
        ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
        : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!);

    const token1AmountMulticall =
      token1Multicall?.toLowerCase() === toLPToken?.address.toLowerCase()!
        ? parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
        : parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!);

    const token0AmountMinMulticall = parseUnits(
      slippageBuffer(parseFloat(fromLPTokenInputAmount)).toString(),
      fromLPToken?.decimals!
    );
    const token1AmountMinMulticall = parseUnits(
      slippageBuffer(parseFloat(toLPTokenInputAmount)).toString(),
      toLPToken?.decimals!
    );

    // const token0 = fromLPToken?.address!;
    // const token1 = toLPToken?.address!;

    const amount0 =
      fromLPToken?.address === token0Address
        ? parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!)
        : parseUnits(toLPTokenInputAmount, toLPToken?.decimals!); // 1 token with 18 decimals
    const amount1 =
      fromLPToken?.address === token0Address
        ? parseUnits(toLPTokenInputAmount, toLPToken?.decimals!)
        : parseUnits(fromLPTokenInputAmount, fromLPToken?.decimals!);

    const amount0Min =
      fromLPToken?.address === token0Address
        ? parseUnits(
            slippageBuffer(parseFloat(fromLPTokenInputAmount)).toString(),
            fromLPToken?.decimals!
          )
        : parseUnits(
            slippageBuffer(parseFloat(toLPTokenInputAmount)).toString(),
            toLPToken?.decimals!
          );
    const amount1Min =
      fromLPToken?.address === token0Address
        ? parseUnits(
            slippageBuffer(parseFloat(toLPTokenInputAmount)).toString(),
            toLPToken?.decimals!
          )
        : parseUnits(
            slippageBuffer(parseFloat(fromLPTokenInputAmount)).toString(),
            fromLPToken?.decimals!
          );
    console.log("fee now", feeTier);

    const fee = parseFloat(feeTier) * 10000;

    const deadline = Math.floor(Date.now() / 1000) + 1200; // 10 min deadline

    console.log("== Mint Params ==");
    console.log("token0:", token0Multicall, fromLPToken?.address);
    console.log("token1:", token1Multicall, toLPToken?.address);
    console.log("fee:", fee);
    console.log("tickLower:", tickLower);
    console.log("tickUpper:", tickUpper);
    console.log(
      "amount0Desired:",
      token0AmountMulticall.toString(),
      fromLPToken?.address
    );
    console.log(
      "amount1Desired:",
      token1AmountMulticall.toString(),
      toLPToken?.address
    );
    console.log("amount0Min:", "0");
    console.log("amount1Min:", "0");
    console.log("deadline:", deadline);

    // try {
    //   const params = {
    //     token0: token0Multicall as Address,
    //     token1: token1Multicall as Address,
    //     fee: 3000,
    //     tickLower: -887220,
    //     tickUpper: 887220,
    //     amount0Desired: token0AmountMulticall,
    //     amount1Desired: token1AmountMulticall,
    //     amount0Min: 0,
    //     amount1Min: 0,
    //     recipient: address,
    //     deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    //   };

    //   console.log("rex params", params);

    //   const rex = await writeContract(config, {
    //     address: chainContractConfig?.v3PositionManagerAddress as Address,
    //     abi: chainContractConfig.v3PositionManagerABI as any,
    //     functionName: "mint",
    //     args: [params],
    //   });

    //   console.log("new rex", rex);
    // } catch (error) {
    //   console.log(" rex error", error);
    // }

    // const tickLower = -95979; // Example ticks
    // const tickUpper = -95779;
    // const fee = parseFloat(feeTier);

    // console.log("tickLower", "tickUpper", tickLower, tickUpper);

    // Encode approval calls (if required)
    // const approveToken0 = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: "approve",
    //   args: [positionManager as Address, amount0],
    // });
    // console.log("approveToken0", approveToken0);
    // const approveToken1 = encodeFunctionData({
    //   abi: erc20Abi,
    //   functionName: "approve",
    //   args: [positionManager as Address, amount1],
    // });
    // console.log("approveToken1", approveToken1);

    console.log("positionManager", positionManager);

    function alignToTickSpacing(tick: number, tickSpacing: number) {
      return Math.round(tick / tickSpacing) * tickSpacing;
    }
    function priceToTick(price: number) {
      if (price < 1e-20) {
        return (
          Math.floor(Math.log(price * 1e20) / Math.log(1.0001)) -
          Math.floor(Math.log(1e20) / Math.log(1.0001))
        );
      }
      return Math.floor(Math.log(price) / Math.log(1.0001));
    }
    const currentPrice = parseFloat(toLPTokenInputAmount);
    const tickLow = alignToTickSpacing(
      priceToTick(currentPrice - currentPrice * activePriceRange),
      tickSpace
    );
    const tickHigh = alignToTickSpacing(
      priceToTick(currentPrice + currentPrice * activePriceRange),
      tickSpace
    );
    // let tickL = -10;
    // let tickH = 10;

    // console.log("tickL", "tickH", tickL, tickH);
    // const tickhigher = tickUpper! * 2;
    console.log("tickLower", "tickUpper", tickLower, tickUpper);
    // Encode mint function call

    const mintLiquidity = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "mint",
      args: [
        {
          token0: token0 as Address,
          token1: token1 as Address,
          fee,
          tickLower,
          tickUpper,
          amount0Desired: amount0,
          amount1Desired: amount1,
          amount0Min: BigInt("0"), //token0AmountMinMulticall,
          amount1Min: BigInt("0"), //token1AmountMinMulticall,
          recipient: address,
          deadline,
        },
      ],
    });

    // Encode mint function call
    const MulticallMintLiquidity = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "mint",
      args: [
        {
          token0: token0Multicall as Address,
          token1: token1Multicall as Address,
          fee,
          tickLower,
          tickUpper,
          amount0Desired: token0AmountMulticall,
          amount1Desired: token1AmountMulticall,
          amount0Min: BigInt("0"), //token0AmountMinMulticall,      // amount0Min: token0AmountMinMulticall,
          amount1Min: BigInt("0"), //token1AmountMinMulticall,  // amount1Min: token1AmountMinMulticall,
          recipient: address,
          deadline,
        },
      ],
    });

    // let sqrt = 0;
    // // Initialize pool
    // if (sqrtPriceX96) {
    //   sqrt = sqrtPriceX96;
    // }

    // const sqrtPriceX96BN = BigNumber.from(sqrtPriceX96?.toString()); // Convert string to BigNumber
    const sqrtPriceX96BN = BigInt(sqrtPriceX96?.toString()!);
    console.log("Converted sqrtPriceX96:", sqrtPriceX96BN.toString());
    // const sq = 5602227458406790178576715587;

    // testPoolCreating

    // const testPoolCreating = await writeContract(config, {
    //   address: chainContractConfig.v3PositionManagerAddress as Address,
    //   abi: chainContractConfig.v3PositionManagerABI,
    //   functionName: "createAndInitializePoolIfNecessary",
    //   args: [
    //     token0Multicall as Address,
    //     token1Multicall as Address,
    //     fee,
    //     sqrtPriceX96BN,
    //   ],
    //   chainId,
    // });

    // const txWaitPoolCreating = await waitForTransaction(config, {
    //   hash: testPoolCreating,
    // });

    // console.log("txWaitPoolCreating", txWaitPoolCreating);

    // try {
    //   const testMint = await writeContract(config, {
    //     address: chainContractConfig.v3PositionManagerAddress as Address,
    //     abi: chainContractConfig.v3PositionManagerABI,
    //     functionName: "mint",
    //     args: [
    //       {
    //         token0: token0Multicall as Address,
    //         token1: token1Multicall as Address,
    //         fee,
    //         tickLower: tickL ?? 0,
    //         tickUpper: tickH ?? 0,
    //         amount0Desired: token0AmountMulticall,
    //         amount1Desired: token1AmountMulticall,
    //         amount0Min: BigInt("0"), //token0AmountMinMulticall,
    //         amount1Min: BigInt("0"), //token1AmountMinMulticall,
    //         recipient: address,
    //         deadline,
    //       },
    //     ],
    //   });

    //   const txWaitMint = await waitForTransaction(config, {
    //     hash: testMint,
    //   });

    //   console.log("txWaitMint", txWaitMint);
    // } catch (error) {
    //   console.error("txWaitMint error", error);
    // } finally {
    //   setIsLoading(false);
    // }

    const initialsPoolsNecessary = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "createAndInitializePoolIfNecessary",
      args: [token0Multicall, token1Multicall, fee, sqrtPriceX96BN],
    });

    // Prepare multicall
    const multicallData = encodeFunctionData({
      abi: chainContractConfig.v3PositionManagerABI,
      functionName: "multicall",
      args: [[initialsPoolsNecessary, MulticallMintLiquidity]],
    });

    // Prepare transaction parameters

    if (poolAddress && fee === poolFee) {
      console.log("mintLiquidity");

      try {
        const tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: mintLiquidity,
          gasLimit: 500000,
        });

        console.log("mint Transaction sent:", tx);
        const transactionReceipt =
          await publicClient!.waitForTransactionReceipt({
            hash: tx,
          });
        console.log("Transaction Receipt:", transactionReceipt);
        if (!transactionReceipt || transactionReceipt.status === "reverted") {
          toast.error("Transaction reverted");
          return;
        }

        // console.log("Transaction Receipt:", transactionReceipt);
        // console.log(
        //   "Transaction transactionHash:",
        //   transactionReceipt.transactionHash
        // );
        // console.log(
        //   "Transaction explorerURL:",
        //   chainContractConfig.explorerURL
        // );
        if (transactionReceipt.status === "success") {
          // Show success notification
          toast.success(
            <div>
              {/* <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
              </p> */}
              <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
              </p>
              <Link
                href={`${
                  chainContractConfig.explorerURL
                }/tx/${transactionReceipt?.transactionHash!}`}
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
          setFromLPTokenInputAmount("");
          setToLPTokenInputAmount("");
          let newBalanceFrom =
            parseFloat(fromLPTokenBalance) - parseFloat(fromLPTokenInputAmount);
          let newBalanceTo =
            parseFloat(toLPTokenBalance) - parseFloat(toLPTokenInputAmount);
          setFromLPTokenBalance(newBalanceFrom.toString());
          setToLPTokenBalance(newBalanceTo.toString());
        }
      } catch (error: any) {
        console.error("Error adding liquidity:", error);
        console.log("Full error:", JSON.stringify(error, null, 2));
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-error-toast",
        });
      } finally {
        setIsLoading(false);
      }
      console.log("mintLiquidity", mintLiquidity);
    } else {
      console.log("multicall");

      try {
        // try {
        //   const tx1 = await signer.sendTransaction({
        //     to: positionManager as Address,
        //     data: initialsPoolsNecessary,
        //     gasLimit: 500000,
        //   });

        //   await publicClient!.waitForTransactionReceipt({
        //     hash: initialsPoolsNecessary,
        //   });
        //   console.log("Pool initialized successfully:", tx1);
        // } catch (error) {
        //   console.log("Pool initialized ", error);
        // }
        //  const transactionHash = await sendTransaction(config, transactionParams);
        const tx = await signer.sendTransaction({
          to: positionManager as Address,
          data: multicallData,
          gasLimit: 5000000,
        });

        console.log("Transaction sent:", tx);
        // await publicClient!.waitForTransactionReceipt({ hash: tx });
        // console.log("Liquidity added successfully!");

        const transactionReceipt =
          await publicClient!.waitForTransactionReceipt({
            hash: tx,
          });

        console.log("Transaction Receipt:", transactionReceipt);
        if (!transactionReceipt || transactionReceipt.status === "reverted") {
          toast.error("Transaction reverted");
          return;
        }

        // console.log(
        //   "Transaction transactionHash:",
        //   transactionReceipt.transactionHash
        // );
        // console.log(
        //   "Transaction explorerURL:",
        //   chainContractConfig.explorerURL
        // );
        if (transactionReceipt.status === "success") {
          // Show success notification
          toast.success(
            <div>
              {/* <p>
                Successfully added liquidity:{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and
                {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}.
              </p> */}
              <p>
                Successfully added liquidity{" "}
                {getTrimmedResult(fromLPTokenInputAmount)} {fromLPToken?.symbol}{" "}
                and {getTrimmedResult(toLPTokenInputAmount)} {toLPToken?.symbol}
                .
              </p>
              <Link
                href={`${
                  chainContractConfig.explorerURL
                }/tx/${transactionReceipt?.transactionHash!}`}
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
          setFromLPTokenInputAmount("");
          setToLPTokenInputAmount("");
          let newBalanceFrom =
            parseFloat(fromLPTokenBalance) - parseFloat(fromLPTokenInputAmount);
          let newBalanceTo =
            parseFloat(toLPTokenBalance) - parseFloat(toLPTokenInputAmount);
          setFromLPTokenBalance(newBalanceFrom.toString());
          setToLPTokenBalance(newBalanceTo.toString());
        }
      } catch (error: any) {
        console.error("Error adding liquidity:", error);
        console.log("Full error:", JSON.stringify(error, null, 2));
        toast.error(error?.shortMessage || "Transaction failed", {
          toastId: "lp-error-toast",
        });
      } finally {
        setIsLoading(false);
      }
    }

};

const handleApprove = async (token: TokenType, amount: string) => {
setIsLoadingApprove(true);
try {
let tokenAmountFormated =
amount.toString().split(".")[1]?.length > (token?.decimals ?? 18)
? parseFloat(amount)
.toFixed(token?.decimals ?? 18)
.toString()
: amount.toString();
const chainContractConfig: ContractConfigItemType =
contractConfig[chainId || "default"];

      const hash = await writeContract(config, {
        address: token.address as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          chainContractConfig?.v3PositionManagerAddress as Address,
          parseUnits(tokenAmountFormated, token?.decimals),
        ],
        chainId: chainId,
      });

      const data = await waitForTransaction(config, {
        hash: hash,
      });

      console.log("wish approve data", data);
      if (data?.status == "success") {
        // setIsApprovedSuccess(true);
        toast.success(
          <div className="card-primary">
            <p>
              Successfully approved {getTrimmedResult(amount)} {token?.symbol}
            </p>
            <Link
              href={`${chainContractConfig?.explorerURL}/tx/${data?.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline"
            >
              See Transaction
            </Link>
          </div>,
          {
            toastId: "approve-swap-token",
          }
        );
      }
    } catch (error: any) {
      console.log("Error while approving", error);
      toast.error(error?.shortMessage, {
        toastId: "approve-swap-token",
      });
    } finally {
      setIsLoadingApprove(false);
    }

};

const fetchFromLpTokenApprovedAmount = async () => {
if (fromLPToken) {
const fromTokenAllowance = await checkLpApproveAllowance(
address,
fromLPToken?.address as Address,
fromLPToken?.chainId,
setIsLoadingFetchApprovedAmount,
config
);
console.log("wish fromTokenAllowance", fromTokenAllowance);

      setFromLpTokenApprovedAmount(
        formatUnits(BigInt(fromTokenAllowance ?? "0"), fromLPToken?.decimals)
      );
    }

};

const fetchToLpTokenApprovedAmount = async () => {
if (toLPToken && toLPToken.address !== "native") {
const toTokenAllowance = await checkLpApproveAllowance(
address,
toLPToken?.address as Address,
toLPToken?.chainId,
setIsLoadingFetchApprovedAmount,
config
);

      setToLpTokenApprovedAmount(
        formatUnits(BigInt(toTokenAllowance ?? "0.0"), toLPToken?.decimals)
      );
    }

};

useEffect(() => {
if (fromLPToken) {
fetchFromLpTokenApprovedAmount();
}
console.log("wish fromLpTokenApprovedAmount", fromLpTokenApprovedAmount);
}, [fromLPToken, address, fromLPTokenInputAmount, isLoadingApprove]);

useEffect(() => {
if (toLPToken) {
fetchToLpTokenApprovedAmount();
}
console.log("wish toLpTokenApprovedAmount", toLpTokenApprovedAmount);
}, [toLPToken, address, toLpTokenApprovedAmount, isLoadingApprove]);

return (
// <div className="py-2">
// {(parseFloat(fromLPTokenInputAmount) > parseFloat(fromLPTokenBalance) ||
// fromLPTokenBalance === "0.00") && (
// <Button
// className="w-full button-primary !font-semibold uppercase h-14 !text-lg my-2"
// disabled={true}
// >
// Insufficient funds ({fromLPToken?.symbol})
// </Button>
// )}
// {(parseFloat(toLPTokenInputAmount) > parseFloat(toLPTokenBalance) ||
// toLPTokenBalance === "0.00") && (
// <Button
// className="w-full button-primary !font-semibold uppercase h-14 !text-lg my-2"
// disabled={true}
// >
// Insufficient funds ({toLPToken?.symbol})
// </Button>
// )}
// {parseFloat(fromLPTokenInputAmount) >
// parseFloat(fromLpTokenApprovedAmount) &&
// fromLPToken &&
// fromLPToken.address != "native" ? (
// // &&
// // !isApprovedSuccess
// <Button
// className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
// onClick={() =>
// handleApprove(fromLPToken!, fromLPTokenInputAmount.toString())
// }
// disabled={
// isLoadingApprove ||
// fromLPToken?.address == toLPToken?.address ||
// parseFloat(fromLPTokenBalance) <
// parseFloat(fromLPTokenInputAmount) ||
// parseFloat(fromLPTokenBalance) === 0 ||
// fromLPTokenBalance === "0.00"
// }
// >
// {isLoadingApprove && <Loader2 size={20} className="animate-spin" />}{" "}
// Approve ({fromLPToken?.symbol})
// </Button>
// ) : parseFloat(toLPTokenInputAmount) >
// parseFloat(toLpTokenApprovedAmount) &&
// toLPToken &&
// toLPToken.address != "native" ? (
// // &&
// // !isApprovedSuccess
// <Button
// className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
// onClick={() =>
// handleApprove(toLPToken, toLPTokenInputAmount.toString())
// }
// disabled={
// isLoadingApprove ||
// fromLPToken?.address == toLPToken?.address ||
// parseFloat(toLPTokenBalance) < parseFloat(toLPTokenInputAmount) ||
// toLPTokenBalance === "0.00" ||
// parseFloat(fromLPTokenBalance) === 0
// }
// >
// {isLoadingApprove && <Loader2 size={20} className="animate-spin" />}{" "}
// Approve ({toLPToken?.symbol})
// </Button>
// ) : (
// <Button
// disabled={
// !fromLPTokenInputAmount ||
// !toLPTokenInputAmount ||
// parseFloat(toLPTokenBalance) < parseFloat(toLPTokenInputAmount) ||
// parseFloat(fromLPTokenBalance) <
// parseFloat(fromLPTokenInputAmount) ||
// parseFloat(fromLPTokenBalance) === 0 ||
// parseFloat(toLPTokenBalance) === 0
// }
// onClick={addLiquidity}
// className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
// >
// {isLoading && <Loader2 size={20} className="animate-spin" />}
// {parseFloat(toLPTokenBalance) < parseFloat(toLPTokenInputAmount) ||
// parseFloat(fromLPTokenBalance) < parseFloat(fromLPTokenInputAmount) ||
// parseFloat(fromLPTokenBalance) === 0 ||
// parseFloat(toLPTokenBalance) === 0
// ? `Insufficient funds ${
    //             parseFloat(toLPTokenBalance) <
    //               parseFloat(toLPTokenInputAmount) ||
    //             parseFloat(fromLPTokenBalance) === 0
    //               ? "(" + toLPToken?.symbol + ")"
    //               : "(" + fromLPToken?.symbol + ")"
    //           }`
// : ` Add Liquidity`}{" "}
// </Button>
// )}
// </div>

<div className="py-2">
{(() => {
const fromInput = parseFloat(fromLPTokenInputAmount || "0");
const toInput = parseFloat(toLPTokenInputAmount || "0");
const fromBalance = parseFloat(fromLPTokenBalance || "0");
const toBalance = parseFloat(toLPTokenBalance || "0");
const fromApproved = parseFloat(fromLpTokenApprovedAmount || "0");
const toApproved = parseFloat(toLpTokenApprovedAmount || "0");

        const isFromInsufficient = fromInput > fromBalance || fromBalance === 0;
        const isToInsufficient = toInput > toBalance || toBalance === 0;
        const isFromApprovalNeeded =
          fromInput > fromApproved && fromLPToken?.address !== "native";
        const isToApprovalNeeded =
          toInput > toApproved && toLPToken?.address !== "native";

        const commonButtonClass = "w-full button-primary uppercase h-10";

        if (isFromInsufficient) {
          return (
            <Button className={commonButtonClass} disabled>
              Insufficient funds ({fromLPToken?.symbol})
            </Button>
          );
        }

        if (isToInsufficient) {
          return (
            <Button className={commonButtonClass} disabled>
              Insufficient funds ({toLPToken?.symbol})
            </Button>
          );
        }

        if (isFromApprovalNeeded) {
          return (
            <Button
              className={commonButtonClass}
              onClick={() =>
                handleApprove(fromLPToken!, fromLPTokenInputAmount.toString())
              }
              disabled={
                isLoadingApprove ||
                fromLPToken?.address === toLPToken?.address ||
                isFromInsufficient
              }
            >
              {isLoadingApprove && (
                <Loader2 size={20} className="animate-spin" />
              )}{" "}
              Approve ({fromLPToken?.symbol})
            </Button>
          );
        }

        if (isToApprovalNeeded) {
          return (
            <Button
              className={commonButtonClass}
              onClick={() =>
                handleApprove(toLPToken!, toLPTokenInputAmount.toString())
              }
              disabled={
                isLoadingApprove ||
                fromLPToken?.address === toLPToken?.address ||
                isToInsufficient
              }
            >
              {isLoadingApprove ? (
                <>
                  {" "}
                  <Loader2 size={20} className="animate-spin" /> Please wait
                </>
              ) : (
                <> Approve ({toLPToken?.symbol})</>
              )}{" "}
            </Button>
          );
        }

        return (
          <>
            <Button
              className={commonButtonClass}
              onClick={addLiquidity}
              disabled={
                !fromInput || !toInput || isFromInsufficient || isToInsufficient
              }
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isFromInsufficient || isToInsufficient
                ? `Insufficient funds (${
                    isToInsufficient ? toLPToken?.symbol : fromLPToken?.symbol
                  })`
                : "Add Liquidity"}
            </Button>
            <Button onClick={addLiquidity2}>add 2</Button>
          </>
        );
      })()}
    </div>

);
};

export default AddLPButton;

//

"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ViewPriceButton from "../ViewPriceButton";
import PriceChart from "../PriceChart";
import MinPriceCard from "../MinPriceCard";
import MaxPriceCard from "../MaxPriceCard";
import PriceRangeButtons from "../PriceRangeButtons";
import AddLPButton from "../AddLPButton";
import { Button } from "@/components/ui/button";
import { useLPStore } from "@/store/useDexStore";
import PriceRangeTabs from "./PriceRangeTabs";
import { TickMath } from "@uniswap/v3-sdk";
// import MinPriceRangeButtons from "./MinPriceRangeButtons";

import { priceToClosestTick } from "@pancakeswap/v3-sdk";
import { Price, Token } from "@pancakeswap/swap-sdk-core";
import { BadgeInfo, OctagonAlert } from "lucide-react";
import { useAccount } from "wagmi";

const PriceRange = () => {
const {
setActiveStep,
fromLPToken,
toLPToken,
basePrice,
tickSpace,
setBaseTick,
baseTick,
setTickRanges,
feeTier,
lpSlippage,
poolAddress,
setBasePrice,
setInverseSqrtPriceX96,
inverseSqrtPriceX96,
setSqrtPriceX96,
sqrtPriceX96,
token0Address,
token1Address,
tickUpperPrice,
tickLowerPrice,
activePriceRange,
} = useLPStore();
const { chainId, chain, address } = useAccount();
const [initialInputAmount, setInitialInputAmount] = useState("");
const [inputAmount, setInputAmount] = useState("");

// Function to align ticks to valid Uniswap tick spacing
function alignToTickSpacing(tick: number, tickSpacing: number) {
return Math.round(tick / tickSpacing) \* tickSpacing;
}

// Convert price to tick using Uniswap's log formula
// function priceToTick(price: number) {
// return Math.floor(Math.log(price) / Math.log(1.0001));
// }

function priceToTick(price: number) {
if (price < 1e-20) {
return (
Math.floor(Math.log(price \* 1e20) / Math.log(1.0001)) -
Math.floor(Math.log(1e20) / Math.log(1.0001))
);
}
return Math.floor(Math.log(price) / Math.log(1.0001));
}

const slippageFactor = lpSlippage! / 100;

// Function to calculate tick ranges
function calculateTickRanges() {
const currentPrice = parseFloat(basePrice);
// const currentTick = priceToClosestTick(currentPrice as any);
// console.log("currentTick", currentTick);

    const baseTickValue = priceToTick(currentPrice);

    // console.log("baseTickValue", baseTickValue, basePrice, currentPrice);

    const alignedBaseTick = alignToTickSpacing(baseTickValue, tickSpace);

    // setBaseTick(baseTick);
    setBaseTick(alignedBaseTick);

    // console.log(
    //   "base tick =",
    //   baseTick,
    //   "alignedBaseTick :",
    //   alignedBaseTick
    //   // "priceToTick(currentPrice * (0.9 - slippageFactor)",
    //   // priceToTick(currentPrice * (0.9 - slippageFactor)),
    //   // "upper",
    //   // priceToTick(currentPrice * (1.1 - slippageFactor))
    // );

    // alignToTickSpacing(priceToTick(currentPrice * (1 - slippageFactor)), tickSpacing);
    // Percentage-based tick ranges
    const tickLow01 = alignToTickSpacing(
      priceToTick(currentPrice * 0.999),
      tickSpace
    );
    const tickHigh01 = alignToTickSpacing(
      priceToTick(currentPrice * 1.001),
      tickSpace
    );
    const tickLow05 = alignToTickSpacing(
      priceToTick(currentPrice * 0.995),
      tickSpace
    );
    const tickHigh05 = alignToTickSpacing(
      priceToTick(currentPrice * 1.005),
      tickSpace
    );

    const tickLow1 = alignToTickSpacing(
      priceToTick(currentPrice * 0.99),
      tickSpace
    );
    const tickHigh1 = alignToTickSpacing(
      priceToTick(currentPrice * 1.01),
      tickSpace
    );

    const tickLow5 = alignToTickSpacing(
      priceToTick(currentPrice * 0.95),
      tickSpace
    );
    const tickHigh5 = alignToTickSpacing(
      priceToTick(currentPrice * 1.05),
      tickSpace
    );

    const tickLow10 = alignToTickSpacing(
      priceToTick(currentPrice * 0.9),
      tickSpace
    );

    const tickHigh10 = alignToTickSpacing(
      priceToTick(currentPrice * 1.1),
      tickSpace
    );

    const tickLow20 = alignToTickSpacing(
      priceToTick(currentPrice * 0.8),
      tickSpace
    );

    const tickHigh20 = alignToTickSpacing(
      priceToTick(currentPrice * 1.2),
      tickSpace
    );

    const tickLow50 = alignToTickSpacing(
      priceToTick(currentPrice * 0.5),
      tickSpace
    );

    const tickHigh50 = alignToTickSpacing(
      priceToTick(currentPrice * 1.5),
      tickSpace
    );

    // Full range (Uniswap V3 min/max ticks)
    const fullRangeLow = alignToTickSpacing(TickMath.MIN_TICK, tickSpace);
    const fullRangeHigh = alignToTickSpacing(TickMath.MAX_TICK, tickSpace);

    return {
      range01: { lower: tickLow01, upper: tickHigh01 },
      range05: { lower: tickLow05, upper: tickHigh05 },
      range1: { lower: tickLow1, upper: tickHigh1 },
      range5: { lower: tickLow5, upper: tickHigh5 },
      range10: { lower: tickLow10, upper: tickHigh10 },
      range20: { lower: tickLow20, upper: tickHigh20 },
      range50: { lower: tickLow50, upper: tickHigh50 },
      fullRange: { lower: fullRangeLow, upper: fullRangeHigh },
    };

}

useEffect(() => {
const ticks = calculateTickRanges();
setTickRanges(ticks);
console.log("0.1% Tick Range:", ticks.range01);
console.log("0.5% Tick Range:", ticks.range05);
console.log("1% Tick Range:", ticks.range1);
console.log("5% Tick Range:", ticks.range5);
console.log("10% Tick Range:", ticks.range10);
console.log("20% Tick Range:", ticks.range20);
console.log("50% Tick Range:", ticks.range50);
console.log("Full Range:", ticks.fullRange);
}, [initialInputAmount]);

// useEffect(() => {
// const ticks = calculateTickRanges();
// setTickRanges(ticks);
// console.log("existing lp pair");

// console.log("0.1% Tick Range:", ticks.range01);
// console.log("0.5% Tick Range:", ticks.range05);
// console.log("1% Tick Range:", ticks.range1);
// console.log("5% Tick Range:", ticks.range5);
// console.log("10% Tick Range:", ticks.range10);
// console.log("20% Tick Range:", ticks.range20);
// console.log("50% Tick Range:", ticks.range50);
// console.log("Full Range:", ticks.fullRange);
// }, []);

function getSqrtPriceX96(price: number) {
const sqrtPrice = Math.sqrt(Number(price)); // Compute square root
return BigInt(Math.floor(sqrtPrice \* 2 \*\* 96)); // Convert to BigInt
}

let inputToken =
fromLPToken?.address! === "native"
? chainId === 56
? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
: chainId === 1
? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
: chainId === 97
? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
: "0x4200000000000000000000000000000000000006"
: fromLPToken?.address;

let outputToken =
toLPToken?.address! === "native"
? chainId === 56
? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
: chainId === 1
? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
: chainId === 97
? "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
: "0x4200000000000000000000000000000000000006"
: toLPToken?.address;

let [token0, token1] =
inputToken?.toLowerCase()! < outputToken?.toLowerCase()!
? [inputToken, outputToken]
: [outputToken, inputToken];

useEffect(() => {
[token0, token1] =
inputToken?.toLowerCase()! < outputToken?.toLowerCase()!
? [inputToken, outputToken]
: [outputToken, inputToken];
}, [fromLPToken, toLPToken]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
let input = e.target.value.replace(/[^0-9.]/g, ""); // Allow only numbers & decimal

    if (input === "") {
      setSqrtPriceX96("0");
      setInverseSqrtPriceX96("0");
      setInitialInputAmount("");
      setBasePrice("");
      return;
    }

    const price = parseFloat(input);
    if (isNaN(price)) return;
    setInputAmount(input);
    try {
      const sqrtPriceX96 = getSqrtPriceX96(price);
      const inversePrice = 1 / price;
      const inverseSqrtPriceX96 = getSqrtPriceX96(inversePrice);

      setSqrtPriceX96(sqrtPriceX96.toString()); // Store as string
      setInverseSqrtPriceX96(inverseSqrtPriceX96.toString());
    } catch (error) {
      console.error("Error calculating sqrtPriceX96:", error);
    }

    if (inputToken?.toLowerCase()! < outputToken?.toLowerCase()!) {
      setInitialInputAmount(input);
      setBasePrice(input);
    } else {
      const price = 1 / parseFloat(input);

      setInitialInputAmount(price.toString());
      setBasePrice(price.toString());
    }

};

useEffect(() => {
if (basePrice && tickSpace) {
calculateTickRanges();
}
}, [basePrice, tickSpace]);

// useEffect(() => {
// // console.log("poolAddress", poolAddress);

// console.log(
// "value creation",
// // fromLPToken?.address,
// token0Address,
// token1Address,
// basePrice
// );
// let price = parseFloat(basePrice);

// let inputToken =
// fromLPToken?.address! === "native"
// ? chainId === 56
// ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
// : chainId === 1
// ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
// : "0x4200000000000000000000000000000000000006"
// : fromLPToken?.address;

// let outputToken =
// toLPToken?.address! === "native"
// ? chainId === 56
// ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
// : chainId === 1
// ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
// : "0x4200000000000000000000000000000000000006"
// : toLPToken?.address;

// if (
// inputToken?.toLowerCase() === token0Address!.toLowerCase() &&
// poolAddress
// ) {
// let newPrice = price;

// setBasePrice(newPrice.toString());
// // console.log(newPrice, price);
// }

// if (
// outputToken?.toLowerCase() === token0Address!.toLowerCase() &&
// poolAddress
// ) {
// let newPrice = price;

// setBasePrice(newPrice.toString());
// // console.log(newPrice, price);
// }

// if (
// inputToken?.toLowerCase() === token1Address!.toLowerCase() &&
// poolAddress
// ) {
// let newPrice = 1 / price;

// setBasePrice(newPrice.toString());
// // console.log(newPrice, price);
// }

// if (
// outputToken?.toLowerCase() === token1Address!.toLowerCase() &&
// poolAddress
// ) {
// let newPrice = 1 / price;

// setBasePrice(newPrice.toString());
// // console.log(newPrice, price);
// }
// // else {
// // setBasePrice("0.0");
// // }
// }, []);

useEffect(() => {
if (
!token0Address ||
!token1Address ||
!fromLPToken ||
!toLPToken ||
!basePrice
)
return;
// console.log(
// "value creation",
// "top",
// fromLPToken?.address,
// "t0",
// token0Address,
// "t1",
// token1Address,
// basePrice
// );
const price = parseFloat(basePrice);

    let newPrice = price;

    // Case 1: Input is token0, output is token1 (use price as is: token1 per token0)
    if (inputToken?.toLowerCase() === token0Address.toLowerCase()) {
      newPrice = price;
    } else {
      newPrice = 1 / price;
    }
    // Case 2: Input is token1, output is token0 (invert price: token0 per token1)
    // else if (outputToken?.toLowerCase() === token0Address.toLowerCase()) {
    //   newPrice = 1 / price;
    // }

    // console.log("base newPrice", newPrice);

    setBasePrice(newPrice.toString());

}, [token0Address, token1Address, fromLPToken, toLPToken, chainId]);

const validPriceRange = [0, 0.001, 0.005, 0.01, 0.05, 0.1, 0.2, 0.5, 1];

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

return (
<>
<div className="flex flex-col w-full ">
<div className="pt-5 md:pt-0 flex flex-row justify-between">
<div
// onClick={calculateTickRanges}
className="uppercase dark:text-[#ffffff] text-base !font-formula font-semibold" >
Set Price Range
</div>
<ViewPriceButton />
</div>
{/_ <div className="py-1 flex ">
<PriceRangeTabs />
</div> _/}

        {/* <PriceChart /> */}
        {/* {!poolAddress && ( */}
        <div className="pt-2">
          <div className="w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
            Set Starting Price
          </div>
          <div className="border rounded-xl mt-2 dark:border-[#FFFFFF0D] active:border-primary focus:border-primary">
            <div className="py-2 text-end px-2">
              <input
                value={inputAmount}
                onInput={handleChange}
                placeholder="0.00"
                type="text"
                className={`focus:outline-none bg-transparent text-[#000] dark:text-[#fff] text-[16px] sm:text-[19px] font-medium text-right w-[9.313rem] md:w-full`}
              />
            </div>
          </div>
        </div>
        {/* )} */}

        <div className="pt-3 w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
          <span>Current price:</span>
          {poolAddress && inputAmount === "" ? (
            <span className="text-black dark:text-white">
              1 {fromLPToken?.symbol!}={" "}
              {isNaN(parseFloat(basePrice))
                ? "0.0"
                : getTrimmedResult(basePrice)}{" "}
              {toLPToken?.symbol!}
            </span>
          ) : (
            <span className="text-black dark:text-white">
              1 {fromLPToken?.symbol!}={" "}
              {isNaN(parseFloat(inputAmount))
                ? "0.0"
                : getTrimmedResult(inputAmount)}{" "}
              {toLPToken?.symbol!}
            </span>
          )}
          {/* <span className="text-black dark:text-white">
            1{" "}
            {token0?.toLowerCase() === inputToken?.toLowerCase()
              ? fromLPToken?.symbol!
              : toLPToken?.symbol!}{" "}
            ={" "}
            {isNaN(parseFloat(basePrice)) ? "0.0" : getTrimmedResult(basePrice)}{" "}
            {token1?.toLowerCase() === outputToken?.toLowerCase()
              ? toLPToken?.symbol!
              : fromLPToken?.symbol!}
          </span> */}
        </div>
        <div className="py-1 pt-3  flex flex-row justify-between columns-2 w-full space-x-2">
          <MinPriceCard />
          <MaxPriceCard />
        </div>

        <div className="py-2 flex gap-2 text-black/60 dark:text-white/60  text-start items-start text-xs">
          <BadgeInfo className="!h-[24px] !w-[24px]" /> Full range is simple and
          covers all prices but increases impermanent loss. Custom range targets
          specific prices for higher efficiency and fees but requires active
          management.
        </div>
        <div>
          {/* {feeTier === "0.01" ? <MinPriceRangeButtons /> : <PriceRangeButtons />} */}
          <PriceRangeButtons />
        </div>
        <div className="space-y-2">
          {parseFloat(tickLowerPrice) > parseFloat(tickUpperPrice) && (
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px]" /> Invalid range
              selected. The min price must be lower than the max price.
            </div>
          )}
          {(parseFloat(tickLowerPrice) > parseFloat(inputAmount) ||
            parseFloat(inputAmount) > parseFloat(tickUpperPrice)) &&
            parseFloat(tickLowerPrice) != 0 &&
            parseFloat(tickUpperPrice) != 0 && (
              <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
                <OctagonAlert className="!h-[24px] !w-[24px] shrink-0 mt-0.5" />
                <span>
                  Your position will not earn fees or be used in trades until
                  the market price moves into your range.
                </span>
              </div>
            )}
          {/* {parseFloat(tickLowerPrice) >= parseFloat(basePrice) && (
            // <div className="p-4 flex gap-1 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-center text-sm">
            //   <OctagonAlert className="!h-[24px] !w-[24px]" /> Your position
            //   will not earn fees or be used in trades until the market price
            //   moves into your range.
            // </div>
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px] shrink-0 mt-0.5" />
              <span>
                Your position will not earn fees or be used in trades until the
                market price moves into your range.
              </span>
            </div>
          )}
          {parseFloat(basePrice) >= parseFloat(tickUpperPrice) && (
            // <div className="p-4 flex gap-1 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-center text-sm">
            //   <OctagonAlert className="!h-[24px] !w-[24px]" /> Your position
            //   will not earn fees or be used in trades until the market price
            //   moves into your range.
            // </div>
            <div className="p-4 flex gap-2 rounded-xl border border-orange-300 text-orange-300 bg-[#db930e43] text-start items-start text-sm">
              <OctagonAlert className="!h-[24px] !w-[24px] shrink-0 mt-0.5" />
              <span>
                Your position will not earn fees or be used in trades until the
                market price moves into your range.
              </span>
            </div>
          )} */}
        </div>
        <div className="pt-3">
          <Button
            className="w-full button-primary uppercase h-10"
            onClick={() => setActiveStep(3)}
            disabled={
              (tickLowerPrice === "" && tickUpperPrice === "") ||
              activePriceRange === null ||
              sqrtPriceX96 === null ||
              !validPriceRange.includes(activePriceRange) ||
              parseFloat(tickLowerPrice) >= parseFloat(tickUpperPrice) ||
              parseFloat(tickLowerPrice) >= parseFloat(inputAmount) ||
              parseFloat(inputAmount) >= parseFloat(tickUpperPrice)
            }
          >
            Continue
          </Button>
        </div>
      </div>
    </>

);
};

export default PriceRange;
