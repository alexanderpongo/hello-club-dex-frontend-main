"use client";
import React, { useEffect, useState } from "react";

import { useLPStore } from "@/store/useDexStore";
import TokenSelectDialog from "../TokenSelectDialog";
import V3FeeTier from "../V3FeeTier";
import DepositAmount from "../DepositAmount";
import { Button } from "@/components/ui/button";
import LPTokenSelectDialog from "./LPTokenSelectDialog";
import { contractConfig } from "@/config/blockchain.config";
import { readContract } from "@wagmi/core";
import {
  Abi,
  Address,
  createPublicClient,
  getContract,
  http,
} from "viem";
import { useAccount, useConfig } from "wagmi";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { ChevronDown, Loader2 } from "lucide-react";
import { useConnectModal } from "@rainbow-me/rainbowkit";

type PoolInfo = {
  fee: number;
  poolAddress: string;
};

const SelectPair = () => {
  const {
    setFromLPToken,
    fromLPToken,
    setToLPToken,
    toLPToken,
    setActiveStep,
    setBasePrice,
    setSqrtPriceX96,
    setPoolAddress,
    setToken0Address,
    setToken1Address,
    poolFee,
    setPoolFee,
    feeTier,
    setFeeTier,
    setTickSpace,
    setPairSelectLiquidity,
    setInitialTick,
    handleContribute,
    setHandleContribute,
    pairSelectLiquidity,
  } = useLPStore();

  const [isLoading, setIsLoading] = useState(false);
  const { chainId, chain, address } = useAccount();
  const config = useConfig();
  const { openConnectModal } = useConnectModal();

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

  async function getPoolConstants() {
    setIsLoading(true);
    const publicClient = createPublicClient({
      chain: chain!,
      transport: http(),
    });
    try {
      const chainContractConfig = contractConfig[chainId || "default"];

      if (!chainContractConfig || !fromLPToken || !toLPToken) {
        throw new Error("Invalid configuration or token data.");
      }
      setBasePrice("");
      const nativeWrappedToken = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

      const feeTiers = [100, 500, 3000, 10000, 25000];

      let poolAddress: any | null = null;

      const poolPromises = feeTiers.map(async (fee) => {
        const pool = await readContract(config, {
          address: chainContractConfig.v3FactoryAddress as Address,
          abi: chainContractConfig.v3FactoryABI,
          functionName: "getPool",
          args: [inputToken!, outputToken!, fee],
        });

        return { fee, poolAddress: pool };
      });

      // Wait for all promises to resolve
      const existingPools = await Promise.all(poolPromises);
      // console.log("existingPools", existingPools);

      console.log(
        "inputToken",
        inputToken,
        "outputToken",
        outputToken,
        "poolFee",
        poolFee
      );

      const pool = await readContract(config, {
        address: chainContractConfig.v3FactoryAddress as Address,
        abi: chainContractConfig.v3FactoryABI,
        functionName: "getPool",
        args: [inputToken!, outputToken!, poolFee],
      });

      console.log("pool", pool);

      // console.log("Checking pool with fee:", poolFee, "Pool Address:", pool);

      if (pool && pool !== "0x0000000000000000000000000000000000000000") {
        poolAddress = pool;
        setPoolAddress(poolAddress);
      }

      if (!poolAddress) {
        throw new Error("No valid pool address found.", poolAddress);
      }

      // console.log("Retrieved pool address:", poolAddress);

      const poolContract = getContract({
        address: poolAddress as `0x${string}`,
        abi: IUniswapV3PoolABI.abi as Abi,
        client: publicClient,
      });

      // **Fetch Base Price**
      async function getBasePrice() {
        setBasePrice("");
        try {
          const result = (await readContract(config, {
            address: poolAddress,
            abi: poolContract.abi!,
            functionName: "slot0",
          })) as [bigint, number, number, number, number, number, boolean];

          const liquidity = (await readContract(config, {
            address: poolAddress,
            abi: poolContract.abi!,
            functionName: "liquidity",
          })) as bigint;

          // console.log("liquidity", liquidity);

          // console.log("wish result", result);
          // console.log("result 1:", result[0]);
          // console.log("result 2:", result[1]);
          setSqrtPriceX96(result[0].toString());
          const sqrtPriceX96 = BigInt(result[0]);
          // console.log("pool sqrtPriceX96", sqrtPriceX96);

          // Raw price (token1 per token0) without decimals normalization
          const rawPrice = (Number(sqrtPriceX96) / 2 ** 96) ** 2;
          const tick = result[1];

          setInitialTick(tick);

          let basePrice: string;
          setPairSelectLiquidity(liquidity);

          // Normalize by token decimals: priceShown = rawPrice * 10^(decimalsToken0 - decimalsToken1)
          // Determine token0/token1 decimals by matching fetched token addresses
          let token0Decimals = 18;
          let token1Decimals = 18;

          try {
            // Resolve the addresses we used to query the pool
            const inAddr = (inputToken || "").toLowerCase();
            const outAddr = (outputToken || "").toLowerCase();

            // Fetch token0/token1 addresses (they may already be read below)
            // We will rely on the values retrieved outside this function if present
            // but if not, we conservatively map using in/out addresses
            // Note: t0/t1 are assigned later before getBasePrice() is called
            // and are available here at runtime.
            // @ts-ignore - rely on runtime availability
            const t0Addr = (typeof t0 === "string" ? t0 : "").toLowerCase();
            // @ts-ignore - rely on runtime availability
            const t1Addr = (typeof t1 === "string" ? t1 : "").toLowerCase();

            if (t0Addr) {
              token0Decimals =
                t0Addr === inAddr
                  ? fromLPToken?.decimals || 18
                  : toLPToken?.decimals || 18;
            }
            if (t1Addr) {
              token1Decimals =
                t1Addr === inAddr
                  ? fromLPToken?.decimals || 18
                  : toLPToken?.decimals || 18;
            }
          } catch (e) {
            // fallback to 18/18 if anything goes wrong
          }

          const decimalFactor = 10 ** (token0Decimals - token1Decimals);
          const normalizedPrice = rawPrice * decimalFactor;

          basePrice = parseFloat(normalizedPrice.toPrecision(15)).toString();
          console.log("SelectPair basePrice", basePrice);

          setBasePrice(basePrice);
          return basePrice;
        } catch (error) {
          console.error("Error fetching base price:", error);
          return null;
        }
      }

      async function getToken0() {
        try {
          const result = (await readContract(config, {
            address: poolAddress,
            abi: poolContract.abi!,
            functionName: "token0",
          })) as string;

          // console.log("wish result address", result);
          return result; // ✅ Return the value
        } catch (error) {
          console.error("Error fetching token0:", error);
          return null;
        }
      }

      async function getToken1() {
        try {
          const result = (await readContract(config, {
            address: poolAddress,
            abi: poolContract.abi!,
            functionName: "token1",
          })) as string;

          // console.log("wish result address", result);
          return result; // ✅ Return the value
        } catch (error) {
          console.error("Error fetching token1:", error); // also update this log
          return null;
        }
      }

      const t1 = await getToken1();
      const t0 = await getToken0();
      setToken1Address(t1!);
      setToken0Address(t0!);
      // console.log("t0", t0, "t1", t1);

      // Call getBasePrice() to fetch price details
      let basePrice;
      if (poolAddress) {
        basePrice = await getBasePrice();
      }

      return {
        poolAddress,
        basePrice,
      };
    } catch (error) {
      console.error("Error fetching pool constants:", error);
      return null;
    }
  }

  const handleContinue = async () => {
    try {
      if (feeTier === "0.01") {
        setTickSpace(1);
        setPoolFee(Number(feeTier) * 10000);
        // console.log(" check feeTier", feeTier);

        const result = await getPoolConstants();
        if (result) {
          if (result.basePrice) {
            setBasePrice(result.basePrice);
          }
        }
      }

      const result = await getPoolConstants();
      if (result) {
        if (result.basePrice) {
          setBasePrice(result.basePrice);
        }
      }
      setActiveStep(2);
    } catch (error) {
      console.error("Error fetching pool constants:", error);
    } finally {
      setIsLoading(false);
      setHandleContribute(false);
    }
  };

  useEffect(() => {
    if (handleContribute) {
      handleContinue();
    }
  }, [handleContribute]);

  return (
    <>
      {handleContribute ? (
        <div className="flex flex-col w-full ">
          <div className="flex flex-col justify-start">
            <div className="uppercase text-primary  font-formula text-lg ">
              Processing...
            </div>
            <p className="text-sm text-neutral-400  font-lato font-normal">
              Processing your request. Please wait while we set up your
              liquidity pool.
            </p>
          </div>

          <div className="flex flex-row items-center space-x-2 w-full py-4">
            <div className="flex-grow">
              {!chain ? (
                <div className="w-full">
                  <Button
                    onClick={openConnectModal}
                    variant={"link"}
                    size={"sm"}
                    className="w-full h-11 py-[9px] px-[10px] dark:bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[16px] border dark:border-[#FFFFFF0D]"
                  >
                    <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                      Select a token
                    </div>
                    <ChevronDown
                      className="dark:text-white"
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              ) : (
                <LPTokenSelectDialog
                  setSelectedToken={setFromLPToken}
                  selectedToken={fromLPToken}
                />
              )}
            </div>
            {/* <div className="text-[#ffffff] inline-flex text-xl font-bold items-center justify-center ">
            +
          </div> */}
            <div className="flex-grow">
              {!chain ? (
                <div className="w-full">
                  <Button
                    onClick={openConnectModal}
                    variant={"link"}
                    size={"sm"}
                    className="w-full h-11 py-[9px] px-[10px] dark:bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[16px] border dark:border-[#FFFFFF0D]"
                  >
                    <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                      Select a token
                    </div>
                    <ChevronDown
                      className="dark:text-white"
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              ) : (
                <LPTokenSelectDialog
                  setSelectedToken={setToLPToken}
                  selectedToken={toLPToken}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <div className="uppercase text-primary  font-formula text-lg">
              Fee tier
            </div>
            <p className="text-sm text-neutral-400 font-lato font-normal">
              The amount earned providing liquidity. Choose an amount that suits
              your risk tolerance and strategy.
            </p>
          </div>
          <div className="py-4">
            <V3FeeTier />
          </div>
          <div className="pt-3">
            <Button
              className="w-full button-primary uppercase h-10"
              disabled={true}
            >
              <Loader2 size={20} className="animate-spin mr-2" />
              Processing...
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full ">
          <div className="flex flex-col justify-start">
            <div className="uppercase text-primary  font-formula text-lg ">
              Choose token pair
            </div>
            <p className="text-sm text-neutral-400  font-lato font-normal">
              Choose the tokens you want to provide liquidity for. You can
              select tokens on all supported networks.
            </p>
          </div>

          <div className="flex flex-row items-center space-x-2 w-full py-4">
            <div className="flex-grow">
              {!chain ? (
                <div className="w-full">
                  <Button
                    onClick={openConnectModal}
                    variant={"link"}
                    size={"sm"}
                    className="w-full h-11 py-[9px] px-[10px] dark:bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[16px] border dark:border-[#FFFFFF0D]"
                  >
                    <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                      Select a token
                    </div>
                    <ChevronDown
                      className="dark:text-white"
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              ) : (
                <LPTokenSelectDialog
                  setSelectedToken={setFromLPToken}
                  selectedToken={fromLPToken}
                />
              )}
            </div>
            {/* <div className="text-[#ffffff] inline-flex text-xl font-bold items-center justify-center ">
            +
          </div> */}
            <div className="flex-grow">
              {!chain ? (
                <div className="w-full">
                  <Button
                    onClick={openConnectModal}
                    variant={"link"}
                    size={"sm"}
                    className="w-full h-11 py-[9px] px-[10px] dark:bg-[#FFFFFF14] hover:no-underline flex flex-row justify-between items-center gap-[10px] rounded-[16px] border dark:border-[#FFFFFF0D]"
                  >
                    <div className="text-xs sm:text-[13px] font-normal dark:text-white">
                      Select a token
                    </div>
                    <ChevronDown
                      className="dark:text-white"
                      width={14}
                      height={14}
                    />
                  </Button>
                </div>
              ) : (
                <LPTokenSelectDialog
                  setSelectedToken={setToLPToken}
                  selectedToken={toLPToken}
                />
              )}
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <div className="uppercase text-primary  font-formula text-lg">
              Fee tier
            </div>
            <p className="text-sm text-neutral-400 font-lato font-normal">
              The amount earned providing liquidity. Choose an amount that suits
              your risk tolerance and strategy.
            </p>
          </div>
          <div className="py-4">
            <V3FeeTier />
          </div>
          <div className="pt-3">
            {!address ? (
              <Button
                className="w-full button-primary uppercase h-10"
                onClick={openConnectModal}
              >
                Connect Wallet
              </Button>
            ) : inputToken?.toLowerCase()! === outputToken?.toLowerCase()! ? (
              <Button
                className="w-full bg-transparent border-2 border-[#ffffff14]  h-10 "
                disabled={true}
              >
                Please select two different tokens.
              </Button>
            ) : (
              <Button
                className="w-full button-primary uppercase h-10"
                disabled={
                  !fromLPToken ||
                  !toLPToken ||
                  fromLPToken.address.toLowerCase() ===
                    toLPToken.address.toLowerCase() ||
                  isLoading
                }
                onClick={handleContinue}
              >
                {isLoading && <Loader2 size={20} className="animate-spin" />}{" "}
                Continue
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SelectPair;
