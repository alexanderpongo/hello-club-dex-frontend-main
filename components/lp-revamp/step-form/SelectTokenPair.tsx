"use client";
import { nativeTokenAddresses } from "@/blockchain/web3.config";
import { Button } from "@/components/ui/button";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ChevronDown, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { http, useAccount, useConfig } from "wagmi";
import LiquidityPoolTokenSelectDialog from "@/components/lp-revamp/models/lp-token-select/LiquidityPoolTokenSelectDialog";
import V3FeeTier from "@/components/lp-revamp/V3FeeTier";
import { Abi, Hex } from "viem";
import { contractConfig } from "@/config/blockchain.config";
import { readContract } from "@wagmi/core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { readContracts } from "@wagmi/core";
import { Price, sqrt, Token } from "@uniswap/sdk-core";
import { FeeAmount, Pool, nearestUsableTick } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { TokenType } from "@/interfaces/index.i";

// Type definitions for contract reads
type Slot0Result = readonly [
  sqrtPriceX96: bigint,
  tick: number,
  observationIndex: number,
  observationCardinality: number,
  observationCardinalityNext: number,
  feeProtocol: number,
  unlocked: boolean
];

const SelectTokenPair = () => {
  const {
    setCurrencyA,
    setCurrencyB,
    currencyA,
    currencyB,
    setActiveStep,
    setBasePrice,
    setInvertedBasePrice,
    poolFee,
    setPoolAddress,
    setToken0,
    setToken1,
    setIsInverted,
  } = useLiquidityPoolStore();
  const [isLoading, setIsLoading] = useState(false);
  const { chainId, chain, address } = useAccount();
  const config = useConfig();
  const { openConnectModal } = useConnectModal();

  let tokenA =
    currencyA?.address! === "native"
      ? chainId === 56
        ? nativeTokenAddresses[56]
        : chainId === 1
        ? nativeTokenAddresses[1]
        : chainId === 8453
        ? nativeTokenAddresses[8453]
        : chainId === 97
        ? nativeTokenAddresses[97]
        : ""
      : currencyA?.address;

  let tokenB =
    currencyB?.address! === "native"
      ? chainId === 56
        ? nativeTokenAddresses[56]
        : chainId === 1
        ? nativeTokenAddresses[1]
        : chainId === 8453
        ? nativeTokenAddresses[8453]
        : chainId === 97
        ? nativeTokenAddresses[97]
        : ""
      : currencyB?.address;

  const getTokenPosition = async (
    poolAddress: Hex,
    position: string
  ): Promise<string | null> => {
    try {
      const result = (await readContract(config, {
        address: poolAddress,
        abi: IUniswapV3PoolABI.abi,
        functionName: position,
        chainId: chainId,
      })) as string;

      return result;
    } catch (error) {
      console.log("Error fetching token0:", error);
      return null;
    }
  };

  const getBasePrice = async (
    poolAddress: Hex,
    token0: TokenType,
    token1: TokenType
  ) => {
    console.log("poolAddress : ", poolAddress);
    const poolContract = {
      address: poolAddress as Hex,
      abi: IUniswapV3PoolABI.abi as Abi,
      chainId: chainId,
    } as const;

    const [slot0, liquidities] = await readContracts(config, {
      contracts: [
        {
          ...poolContract,
          functionName: "slot0",
        },
        {
          ...poolContract,
          functionName: "liquidity",
        },
      ],
    });

    const slot0Data = slot0.result as Slot0Result;
    const liquidityAmount = liquidities.result as bigint;

    const sqrtRatioX96 = JSBI.BigInt(slot0Data[0].toString());
    const liquidity = JSBI.BigInt(liquidityAmount.toString());

    const Token0 = new Token(
      chainId!,
      token0!.address,
      token0!.decimals,
      token0!.symbol,
      token0!.name
    );

    const Token1 = new Token(
      chainId!,
      token1!.address,
      token1!.decimals,
      token1!.symbol,
      token1!.name
    );

    // pass the FeeAmount based on poolFee
    const feeAmount =
      poolFee === 100
        ? 100
        : poolFee === 500
        ? 500
        : poolFee === 3000
        ? 3000
        : poolFee === 10000
        ? 10000
        : poolFee === 25000
        ? 25000
        : 3000; // default

    try {
      const pool = new Pool(
        Token0,
        Token1,
        feeAmount as FeeAmount,
        sqrtRatioX96,
        liquidity,
        slot0Data[1]
      );

      // Canonical orientation: store pool token0 -> token1 price.
      // priceOf(Token0) gives Token0 in terms of Token1. Inverted is Token1 in terms of Token0.
      const canonicalPrice = pool.priceOf(Token0); // token0 denominated in token1
      const canonicalInverse = pool.priceOf(Token1); // token1 denominated in token0

      console.log("pool Instance data : ", {
        poolFee,
        poolAddress,
        poolInstance: pool,
        slot0: slot0Data,
        liquidityAmount,
        canonicalPrice: canonicalPrice.toSignificant(6),
        canonicalInverse: canonicalInverse.toSignificant(6),
        sqrtRatioX96: sqrtRatioX96.toString(),
        poolInstanceLiq: pool.liquidity.toString(),
      });

      // Set isInverted if user's currencyA is NOT pool token0 (so UI can invert for display without swapping tokens).
      const userTokenAAddress = tokenA?.toLowerCase();
      const poolToken0Address = token0.address.toLowerCase();
      console.log("isInverted : ", userTokenAAddress !== poolToken0Address);
      setIsInverted(userTokenAAddress !== poolToken0Address);

      setBasePrice(canonicalPrice as unknown as Price<Token, Token>);
      setInvertedBasePrice(canonicalInverse as unknown as Price<Token, Token>);

      console.log("canonicalPrice", canonicalPrice.toSignificant(6));
      console.log("canonicalInverse", canonicalInverse.toSignificant(6));
    } catch (error) {
      console.log("Error creating pool instance:", error);
    }
  };

  const getPoolConstants = async () => {
    setIsLoading(true);

    try {
      const chainContractConfig = contractConfig[chainId || "default"];
      if (!chainContractConfig || !currencyA || !currencyB) {
        throw new Error("Invalid configuration or token data.");
      }
      setBasePrice(null);

      const pool = await readContract(config, {
        address: chainContractConfig.v3FactoryAddress as Hex,
        abi: chainContractConfig.v3FactoryABI,
        functionName: "getPool",
        args: [tokenA!, tokenB!, poolFee],
      });

      console.log("pool : ", pool);

      if (pool !== "0x0000000000000000000000000000000000000000") {
        setPoolAddress(pool as Hex);
        const token0 = await getTokenPosition(pool as Hex, "token0");

        const Token0 =
          tokenA?.toLowerCase() === token0?.toLowerCase()
            ? currencyA
            : currencyB;

        const wrappedAddress0 =
          tokenA?.toLowerCase() === token0?.toLowerCase() ? tokenA : tokenB;

        setToken0({
          address: wrappedAddress0!,
          chainId: Token0.chainId,
          decimals: Token0.decimals,
          symbol: Token0.symbol,
          name: Token0.name,
          logoURI: Token0.logoURI,
        });

        const token1 = await getTokenPosition(pool as Hex, "token1");

        const Token1 =
          tokenA?.toLowerCase() === token1?.toLowerCase()
            ? currencyA
            : currencyB;

        const wrappedAddress1 =
          tokenA?.toLowerCase() === token1?.toLowerCase() ? tokenA : tokenB;

        setToken1({
          address: wrappedAddress1!,
          chainId: Token1.chainId,
          decimals: Token1.decimals,
          symbol: Token1.symbol,
          name: Token1.name,
          logoURI: Token1.logoURI,
        });
        const priceInfo = await getBasePrice(
          pool as Hex,
          {
            address: wrappedAddress0!,
            chainId: Token0.chainId,
            decimals: Token0.decimals,
            symbol: Token0.symbol,
            name: Token0.name,
            logoURI: Token0.logoURI,
          },
          {
            address: wrappedAddress1!,
            chainId: Token1.chainId,
            decimals: Token1.decimals,
            symbol: Token1.symbol,
            name: Token1.name,
            logoURI: Token1.logoURI,
          }
        );
      } else {
        setPoolAddress(null);

        // create tokenA and tokenB Token objects
        const tokenAObj = new Token(
          chainId!,
          tokenA!,
          currencyA.decimals,
          currencyA.symbol,
          currencyA.name
        );

        const tokenBObj = new Token(
          chainId!,
          tokenB!,
          currencyB.decimals,
          currencyB.symbol,
          currencyB.name
        );

        // canonical ordering
        let token0: Token;
        let token1: Token;
        if (tokenAObj.equals(tokenBObj)) {
          // identical tokens — handle as error or treat as single token
          throw new Error("Tokens must be different");
        }

        if (tokenAObj.sortsBefore(tokenBObj)) {
          token0 = tokenAObj;
          token1 = tokenBObj;
        } else {
          token0 = tokenBObj;
          token1 = tokenAObj;
        }

        console.log("mock pool token0: ", token0);
        console.log("mock pool token1: ", token1);

        // Set token0 state
        setToken0({
          address: token0.address,
          chainId: token0.chainId,
          decimals: token0.decimals,
          symbol: token0.symbol!,
          name: token0.name!,
          logoURI:
            token0.address.toLowerCase() === tokenA?.toLowerCase()
              ? currencyA.logoURI
              : currencyB.logoURI,
        });

        // Set token1 state
        setToken1({
          address: token1.address,
          chainId: token1.chainId,
          decimals: token1.decimals,
          symbol: token1.symbol!,
          name: token1.name!,
          logoURI:
            token1.address.toLowerCase() === tokenA?.toLowerCase()
              ? currencyA.logoURI
              : currencyB.logoURI,
        });

        const userTokenAAddress = tokenA?.toLowerCase();
        const poolToken0Address = token0.address.toLowerCase();
        console.log("userTokenAAddress : ", userTokenAAddress);
        console.log("poolToken0Address : ", poolToken0Address);
        console.log("isInverted : ", userTokenAAddress !== poolToken0Address);
        setIsInverted(userTokenAAddress !== poolToken0Address);
      }
      setActiveStep(2);
    } catch (error) {
      console.log("Error fetching pool data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full ">
      <div className="flex flex-col justify-start">
        <div className="uppercase text-primary  font-formula text-lg ">
          Choose token pair
        </div>
        <p className="text-sm text-neutral-400  font-lato font-normal">
          Choose the tokens you want to provide liquidity for. You can select
          tokens on all supported networks.
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
            <LiquidityPoolTokenSelectDialog
              setSelectedToken={setCurrencyA}
              selectedToken={currencyA}
            />
          )}
        </div>

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
            <LiquidityPoolTokenSelectDialog
              setSelectedToken={setCurrencyB}
              selectedToken={currencyB}
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
        ) : tokenA?.toLowerCase()! === tokenB?.toLowerCase()! ? (
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
              !currencyA ||
              !currencyB ||
              currencyA.address.toLowerCase() ===
                currencyB.address.toLowerCase() ||
              isLoading
            }
            onClick={getPoolConstants}
          >
            {isLoading && <Loader2 size={20} className="animate-spin" />}{" "}
            Continue
          </Button>
        )}
      </div>
    </div>
  );
};

export default SelectTokenPair;
