"use client";
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import LPSlippageSettingDialog from "@/components/evm/lp/LPSlippageSettingDialog";
import { SinglePoolData } from "@/types/trading-live-table.types";
import TradeLpTop from "@/components/trading-live-inner/TradeLpTop";
import TradeLpBottom from "@/components/trading-live-inner/TradeLpBottom";
import TradeAddLPButton from "@/components/trading-live-inner/TradeAddLpButton";
import { useAccount, useConfig } from "wagmi";
import SwitchNetworkButton from "@/components/trading-live-inner/SwitchNetworkButton";
import TradingLiquidityRangeSelector from "@/components/trading-live-inner/TradingLiquidityRangeSelector";
import MinPriceCard from "@/components/trading-live-inner/MinPriceCard";
import MaxPriceCard from "@/components/trading-live-inner/MaxPriceCard";
import { useTradingLivePoolStore } from "@/store/trading-live-pool-store";
import { Abi, Hex } from "viem";
import { TokenType } from "@/interfaces/index.i";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { readContract, readContracts } from "@wagmi/core";
import JSBI from "jsbi";
import { Price, Token } from "@uniswap/sdk-core";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import CurrentPrice from "@/components/trading-live-inner/CurrentPrice";

type AddLpProps = {
  poolData: SinglePoolData;
};

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

const AddLiquidity = ({ poolData }: AddLpProps) => {
  const { address, chainId, chain } = useAccount();
  const {
    setCurrencyA,
    setCurrencyB,
    setBasePrice,
    currencyA,
    currencyB,
    basePrice,
    rangeSelectMaxValue,
    rangeSelectMinValue,
    isFullRangeSelected,
  } = useTradingLivePoolStore();
  const [lpBasePrice, setLpBasePrice] = useState(0);
  const [tradeChainId, setTradeChainId] = useState<number>(1);
  const config = useConfig();
  const [disableInputs, setDisableInputs] = useState(false);

  // pool chain Id

  const poolChainId =
    poolData.chain.id === "bsc"
      ? 56
      : poolData.chain.id === "ethereum"
      ? 1
      : 8453;

  const poolFee = poolData.fee_tier_raw;

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

  useEffect(() => {
    console.log("poolData in AddLiquidity : ", poolData);

    if (poolData) {
      // Map API tokens to LP store shape
      setCurrencyA({
        name: poolData.token0.name,
        symbol: poolData.token0.symbol,
        address: poolData.token0.address,
        decimals: poolData.token0.decimals,
        logoURI: poolData.token0.logo || "",
        chainId: tradeChainId,
      });

      setCurrencyB({
        name: poolData.token1.name,
        symbol: poolData.token1.symbol,
        address: poolData.token1.address,
        decimals: poolData.token1.decimals,
        logoURI: poolData.token1.logo || "",
        chainId: tradeChainId,
      });

      const mappedChainId =
        poolData.chain.id === "bsc"
          ? 56
          : poolData.chain.id === "ethereum"
          ? 1
          : poolData.chain.id === "base"
          ? 8453
          : 97;
      setTradeChainId(mappedChainId);

      // const sqrtPriceX96 = BigInt(poolData.sqrt_price);
      // const tradeBasePrice = (Number(sqrtPriceX96) / 2 ** 96) ** 2;
      // setLpBasePrice(tradeBasePrice);
    }
  }, [poolData, tradeChainId]);

  const getChainName = (id: number | string | undefined) => {
    switch (Number(id)) {
      case 1:
        return "Ethereum";
      case 56:
        return "BSC";
      case 8453:
        return "Base";
      default:
        return "Unknown Network";
    }
  };

  // Check if user is on wrong network
  const isWrongNetwork = address && chainId !== tradeChainId;

  // getBasePrice

  const getBasePrice = async (
    poolAddress: Hex,
    token0: TokenType,
    token1: TokenType
  ) => {
    console.log("poolAddress : ", poolAddress);
    console.log("tradeChainId : ", tradeChainId);

    const poolContract = {
      address: poolAddress as Hex,
      abi: IUniswapV3PoolABI.abi as Abi,
      chainId: tradeChainId,
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
    console.log("slot0Data : ", slot0Data);
    const liquidityAmount = liquidities.result as bigint;
    console.log("liquidityAmount : ", liquidityAmount);

    if (!slot0Data || !liquidityAmount) {
      console.log("Failed to fetch pool data.");
      return;
    }

    const sqrtRatioX96 = JSBI.BigInt(slot0Data[0].toString());
    const liquidity = JSBI.BigInt(liquidityAmount.toString());

    const Token0 = new Token(
      tradeChainId!,
      token0!.address,
      token0!.decimals,
      token0!.symbol,
      token0!.name
    );

    const Token1 = new Token(
      tradeChainId!,
      token1!.address,
      token1!.decimals,
      token1!.symbol,
      token1!.name
    );

    try {
      const pool = new Pool(
        Token0,
        Token1,
        feeAmount as FeeAmount,
        sqrtRatioX96,
        liquidity,
        slot0Data[1]
      );

      const canonicalPrice = pool.priceOf(Token0);

      console.log("pool Instance data : ", {
        poolFee,
        poolAddress,
        poolInstance: pool,
        slot0: slot0Data,
        liquidityAmount,
        canonicalPrice: canonicalPrice.toSignificant(6),
        sqrtRatioX96: sqrtRatioX96.toString(),
        poolInstanceLiq: pool.liquidity.toString(),
      });

      setBasePrice(canonicalPrice as unknown as Price<Token, Token>);
    } catch (error) {
      console.log("Error creating pool instance:", error);
    }
  };

  useEffect(() => {
    if (poolData.pool_address && tradeChainId) {
      getBasePrice(
        poolData.pool_address as Hex,
        {
          name: poolData.token0.name,
          symbol: poolData.token0.symbol,
          address: poolData.token0.address,
          decimals: poolData.token0.decimals,
          logoURI: poolData.token0.logo || "",
          chainId: tradeChainId,
        },
        {
          name: poolData.token1.name,
          symbol: poolData.token1.symbol,
          address: poolData.token1.address,
          decimals: poolData.token1.decimals,
          logoURI: poolData.token1.logo || "",
          chainId: tradeChainId,
        }
      );
    }
  }, [poolData, tradeChainId]);

  useEffect(() => {
    console.log("rangeSelectMinValue, rangeSelectMaxValue changed: ", {
      rangeSelectMinValue,
      rangeSelectMaxValue,
    });

    if (
      rangeSelectMinValue === 0 &&
      rangeSelectMaxValue === 0 &&
      isFullRangeSelected === false
    ) {
      setDisableInputs(true);
    } else {
      setDisableInputs(false);
    }
  }, [rangeSelectMinValue, rangeSelectMaxValue]);

  return (
    <Card className="w-full card-primary rounded-xl flex flex-col items-center justify-center p-5 space-y-3">
      <>
        <div className="flex  justify-between items-center w-full p-2">
          <div className="text-primary text-[32px] font-formula leading-7 font-light uppercase">
            Add Liquidity
          </div>
          <div>
            <LPSlippageSettingDialog />
          </div>
        </div>
        <div className="flex flex-col w-full">
          <div className="flex flex-col w-full ">
            <div className="pt-3 pb-2 w-full text-xs md:text-sm font-bold flex items-center space-x-2 text-black/60 dark:text-white/60">
              <CurrentPrice
                tradeChainId={tradeChainId}
                poolAddress={poolData.pool_address as Hex}
                poolFee={feeAmount}
              />
            </div>
            <TradingLiquidityRangeSelector feeTier={poolData.fee_tier_raw} />
            <div className="py-1 pt-3  flex flex-row justify-between columns-2 w-full space-x-2">
              <MinPriceCard />
              <MaxPriceCard />
            </div>
          </div>
          <div className="flex flex-col w-full mt-3">
            <div className="flex flex-col justify-start">
              <p className="text-sm text-neutral-400 font-lato font-normal">
                Specify the token amounts for your liquidity contribution.
              </p>
            </div>

            <div className="flex flex-col w-full pt-1">
              <TradeLpTop
                tradeChainId={tradeChainId}
                disabled={disableInputs || isWrongNetwork!}
              />
              <TradeLpBottom
                tradeChainId={tradeChainId}
                disabled={isWrongNetwork || disableInputs}
                poolAddress={poolData.pool_address as Hex}
                poolFee={feeAmount}
              />
              <div className="pt-3 mt-4">
                {isWrongNetwork ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex justify-center text-center items-center gap-2 text-[#ffac2f] text-xs font-sans font-light px-2">
                      <AlertTriangle
                        size={14}
                        className="sm:flex flex-shrink-0 hidden"
                      />
                      <span className="break-words">
                        Please switch your network to{" "}
                        <span className="font-medium">
                          {getChainName(tradeChainId)}
                        </span>{" "}
                        to continue adding liquidity.
                      </span>
                    </div>
                    <SwitchNetworkButton
                      targetChainId={tradeChainId}
                      chainName={getChainName(tradeChainId)}
                    />
                  </div>
                ) : (
                  <TradeAddLPButton poolData={poolData} />
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    </Card>
  );
};

export default AddLiquidity;
