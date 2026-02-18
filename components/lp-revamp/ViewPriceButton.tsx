"use client";
import React, { useMemo } from "react";
import { Button } from "../ui/button";
import { ArrowRightLeft } from "lucide-react";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import {
  nearestUsableTick,
  priceToClosestTick,
  TICK_SPACINGS,
  TickMath,
  tickToPrice,
} from "@uniswap/v3-sdk";
import { useAccount, useConfig } from "wagmi";
import { Hex } from "viem";
import { Price, Token } from "@uniswap/sdk-core";
import JSBI from "jsbi";
import { getTickSpacingForFee } from "@/lib/utils";

interface ViewPriceButtonProps {
  inputAmount: string;
  setInputAmount: (value: string) => void;
  poolPriceWhenPoolNotInitialized: Price<Token, Token> | undefined;
}

const ViewPriceButton: React.FC<ViewPriceButtonProps> = (props) => {
  const { inputAmount, poolPriceWhenPoolNotInitialized } = props;
  const {
    poolFee,
    poolAddress,
    basePrice,
    rangeSelectMaxValue,
    rangeSelectMinValue,
    isFullRangeSelected,
    isInverted,
    currencyA,
    currencyB,
    setCurrencyA,
    setCurrencyB,
    setIsInverted,
    token0,
    token1,
    setTickLowerPrice,
    setTickUpperPrice,
    setTickSpace,
    setLowerTick,
    setUpperTick,
    setCanonicalTickLower,
    setCanonicalTickUpper,
  } = useLiquidityPoolStore();
  const config = useConfig();
  const { chainId } = useAccount();

  // Detect SQRT_RATIO errors thrown by Uniswap tick math
  function isSqrtRatioError(e: unknown) {
    return (
      e instanceof Error &&
      typeof e.message === "string" &&
      e.message.toUpperCase().includes("SQRT_RATIO")
    );
  }

  // Safely convert a Price to the closest tick, clamping to protocol bounds when needed
  function safePriceToClosestTick(
    price: Price<Token, Token>,
    tokenA: Token,
    tokenB: Token,
    tickSpacing: number
  ): number {
    const minTick = nearestUsableTick(TickMath.MIN_TICK, tickSpacing);
    const maxTick = nearestUsableTick(TickMath.MAX_TICK, tickSpacing);
    const minPrice = tickToPrice(tokenA, tokenB, minTick);
    const maxPrice = tickToPrice(tokenA, tokenB, maxTick);

    try {
      return priceToClosestTick(price as unknown as any);
    } catch (e) {
      if (isSqrtRatioError(e)) {
        // price outside representable sqrt ratio range; clamp to nearest boundary
        // Using Price comparison on sdk-core Fraction
        // If comparisons fail for any reason, fall back to boundary conservatively
        try {
          if ((price as any).lessThan(minPrice as any)) return minTick;
          if ((price as any).greaterThan(maxPrice as any)) return maxTick;
        } catch (_cmpErr) {
          // Fallback: if it threw, choose closest boundary by magnitude heuristic
          return minTick;
        }
        // If inside but still failed (rare rounding), pick nearest by distance
        const midTick = Math.round((minTick + maxTick) / 2);
        return midTick;
      }
      throw e;
    }
  }

  // normalize decimal/scientific notation to integer string + decimals count
  function toIntegerAndDecimals(
    value: string,
    maxFractionDigits?: number
  ): {
    integerStr: string;
    decimals: number;
  } {
    const v = value.trim();
    const match = v.match(/^([+-]?)(\d+(?:\.\d+)?)(?:[eE]([+-]?\d+))?$/);
    if (!match) {
      throw new SyntaxError(`Invalid numeric string: ${value}`);
    }
    const sign = match[1];
    if (sign === "-") {
      throw new SyntaxError("Price must be non-negative");
    }
    const mantissa = match[2];
    const exp = match[3] ? parseInt(match[3], 10) : 0;

    const parts = mantissa.split(".");
    const wholePart = parts[0] || "0";
    const fracPart = parts[1] || "";
    const mantissaDigits = wholePart + fracPart; // digits only
    const mantissaFracLen = fracPart.length;

    const shift = exp - mantissaFracLen;
    let whole = "";
    let fraction = "";

    if (shift >= 0) {
      whole = mantissaDigits + "0".repeat(shift);
      fraction = "";
    } else {
      const idx = mantissaDigits.length + shift; // shift is negative
      if (idx <= 0) {
        whole = "0";
        fraction = "0".repeat(-idx) + mantissaDigits;
      } else {
        whole = mantissaDigits.slice(0, idx);
        fraction = mantissaDigits.slice(idx);
      }
    }

    if (maxFractionDigits !== undefined && maxFractionDigits >= 0) {
      if (fraction.length > maxFractionDigits) {
        fraction = fraction.slice(0, maxFractionDigits);
      }
    }

    let integerStr = (whole + fraction).replace(/^0+/, "");
    if (integerStr.length === 0) integerStr = "0";
    const decimals = fraction.length;
    return { integerStr, decimals };
  }

  // create Price object
  function tryParsePrice(baseToken: Token, quoteToken: Token, value: string) {
    console.log("tryParsePrice value:", value);
    const { integerStr, decimals } = toIntegerAndDecimals(value);
    const withoutDecimals = JSBI.BigInt(integerStr);

    const numerator = JSBI.multiply(
      withoutDecimals,
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(quoteToken.decimals))
    );

    // Calculate Denominator: 10^(decimals) * 10^(baseDecimals)
    const denominator = JSBI.multiply(
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(decimals)),
      JSBI.exponentiate(JSBI.BigInt(10), JSBI.BigInt(baseToken.decimals))
    );

    return new Price(baseToken, quoteToken, denominator, numerator);
  }

  // create Token instances
  const tokens = useMemo(() => {
    try {
      if (!token0 || !token1) return null;
      const tokenA = new Token(
        chainId as number,
        token0.address as Hex,
        (token0.decimals as number) ?? 18,
        token0.symbol,
        token0.name
      );
      const tokenB = new Token(
        chainId as number,
        token1.address as Hex,
        (token1.decimals as number) ?? 18,
        token1.symbol,
        token1.name
      );
      return { tokenA, tokenB };
    } catch (error) {
      console.error("Error creating Token instances:", error);
      return null;
    }
  }, [token0, token1, chainId]);

  // current price derivation
  const currentPrice = useMemo(() => {
    if (
      poolAddress === null ||
      poolAddress === "0x0000000000000000000000000000000000000000"
    ) {
      // return parseFloat(
      //   poolPriceWhenPoolNotInitialized?.toSignificant(6) || "0"
      // );
      return poolPriceWhenPoolNotInitialized
        ? parseFloat(
            (isInverted
              ? poolPriceWhenPoolNotInitialized.invert()
              : poolPriceWhenPoolNotInitialized
            ).toSignificant(6)
          )
        : 0;
    } else {
      return basePrice
        ? parseFloat(
            (isInverted ? basePrice.invert() : basePrice).toSignificant(6)
          )
        : 0;
    }
  }, [isInverted, basePrice, poolAddress, poolPriceWhenPoolNotInitialized]);

  // user input based ticks setTickLowerPrice and setTickUpperPrice
  const userTicksBasedOnInputs = useMemo(async () => {
    // if (inputAmount === "0" || inputAmount === "") return;
    if (
      (poolAddress === null && inputAmount.length === 0) ||
      parseFloat(inputAmount) === 0
    )
      return;
    const tickSpace = await getTickSpacingForFee(poolFee);
    setTickSpace(tickSpace);

    console.log("userTicksBasedOnInputs : ", {
      tickSpace,
      poolFee,
      poolAddress,
      currentPrice,
    });

    if (isFullRangeSelected && tokens?.tokenA && tokens?.tokenB) {
      try {
        // Obtain tickSpacing (dynamic for custom fee tiers like 25000, else from TICK_SPACINGS)

        let fullRangeLower = nearestUsableTick(TickMath.MIN_TICK, tickSpace);

        let fullRangeUpper = nearestUsableTick(TickMath.MAX_TICK, tickSpace);

        // For inverted view we still keep ordering lower < upper; pricing interpretation handled elsewhere.
        if (fullRangeLower > fullRangeUpper) {
          const tmp = fullRangeLower;
          fullRangeLower = fullRangeUpper;
          fullRangeUpper = tmp;
        }

        setLowerTick(fullRangeLower);
        setUpperTick(fullRangeUpper);

        const lowerPriceDisplay = tickToPrice(
          tokens.tokenA,
          tokens.tokenB,
          fullRangeLower
        ).toSignificant(6);
        const upperPriceDisplay = tickToPrice(
          tokens.tokenA,
          tokens.tokenB,
          fullRangeUpper
        ).toSignificant(6);
        return; // Early exit; do not compute percentage-based ticks
      } catch (e) {
        console.error("Error computing full range ticks", e);
      }
    }

    if (rangeSelectMinValue === 0 || rangeSelectMaxValue === 0) {
      return;
    }

    let lowerPrice = currentPrice * rangeSelectMinValue;
    let upperPrice = currentPrice * rangeSelectMaxValue;

    const lowerPriceStr = lowerPrice.toString();
    const upperPriceStr = upperPrice.toString();

    const priceLowerObj = tryParsePrice(
      tokens?.tokenA!,
      tokens?.tokenB!,
      lowerPriceStr
    );
    const priceUpperObj = tryParsePrice(
      tokens?.tokenA!,
      tokens?.tokenB!,
      upperPriceStr
    );

    if (!priceLowerObj || !priceUpperObj) return;

    let tickLower, tickUpper;

    console.log("priceLowerObj : ", priceLowerObj.toSignificant(6));
    console.log("priceUpperObj : ", priceUpperObj.toSignificant(6));

    if (isInverted) {
      const invUpper = priceUpperObj.invert() as unknown as Price<Token, Token>;
      const invLower = priceLowerObj.invert() as unknown as Price<Token, Token>;
      tickLower = safePriceToClosestTick(
        invUpper,
        tokens?.tokenA!,
        tokens?.tokenB!,
        tickSpace as number
      );
      tickUpper = safePriceToClosestTick(
        invLower,
        tokens?.tokenA!,
        tokens?.tokenB!,
        tickSpace as number
      );
    } else {
      tickLower = safePriceToClosestTick(
        priceLowerObj as unknown as Price<Token, Token>,
        tokens?.tokenA!,
        tokens?.tokenB!,
        tickSpace as number
      );
      tickUpper = safePriceToClosestTick(
        priceUpperObj as unknown as Price<Token, Token>,
        tokens?.tokenA!,
        tokens?.tokenB!,
        tickSpace as number
      );
    }

    if (tickLower > tickUpper) {
      const tmp = tickLower;
      tickLower = tickUpper;
      tickUpper = tmp;
    }

    if (!tickSpace) return;

    const nearestTickLower = nearestUsableTick(tickLower, tickSpace as number);

    setLowerTick(nearestTickLower);
    const nearestTickUpper = nearestUsableTick(tickUpper, tickSpace as number);
    setUpperTick(nearestTickUpper);

    const priceAtLowerTick = tickToPrice(
      tokens?.tokenA!,
      tokens?.tokenB!,
      nearestTickLower
    );

    const priceAtUpperTick = tickToPrice(
      tokens?.tokenA!,
      tokens?.tokenB!,
      nearestTickUpper
    );

    setTickLowerPrice(priceAtLowerTick.toSignificant(6));
    setTickUpperPrice(priceAtUpperTick.toSignificant(6));
  }, [
    poolAddress,
    currentPrice,
    rangeSelectMinValue,
    rangeSelectMaxValue,
    tokens,
    isFullRangeSelected,
    inputAmount,
  ]);

  // token0/token1 based ticks setCanonicalTickLower and setCanonicalTickUpper
  useMemo(async () => {
    if (
      (poolAddress === null && inputAmount.length === 0) ||
      parseFloat(inputAmount) === 0
    )
      return;
    const tickSpace = await getTickSpacingForFee(poolFee);

    let tickSpacing = tickSpace as number;

    if (poolAddress !== null) {
      if (isFullRangeSelected && tokens?.tokenA && tokens?.tokenB) {
        try {
          if (poolFee !== 25000) {
            tickSpacing = TICK_SPACINGS[
              poolFee as keyof typeof TICK_SPACINGS
            ] as number;
          } else {
            tickSpacing = Number(tickSpace);
          }

          let fullRangeLower = nearestUsableTick(
            TickMath.MIN_TICK,
            tickSpacing
          );

          let fullRangeUpper = nearestUsableTick(
            TickMath.MAX_TICK,
            tickSpacing
          );

          if (fullRangeLower > fullRangeUpper) {
            const tmp = fullRangeLower;
            fullRangeLower = fullRangeUpper;
            fullRangeUpper = tmp;
          }

          setCanonicalTickLower(fullRangeLower);
          setCanonicalTickUpper(fullRangeUpper);
          return;
        } catch (error) {
          console.error("Error computing full range canonical ticks", error);
        }
      }

      if (rangeSelectMinValue === 0 || rangeSelectMaxValue === 0) {
        return;
      }

      let _CPrice;

      if (poolAddress === null) {
        if (isInverted) {
          _CPrice = parseFloat(
            poolPriceWhenPoolNotInitialized?.invert().toSignificant(6) || "0"
          );
        } else {
          _CPrice = parseFloat(
            poolPriceWhenPoolNotInitialized?.toSignificant(6) || "0"
          );
        }
      } else {
        _CPrice = parseFloat(basePrice?.toSignificant(6) || "0");
      }

      let lowerPrice = _CPrice * rangeSelectMinValue;
      let upperPrice = _CPrice * rangeSelectMaxValue;

      const lowerPriceStr = lowerPrice.toString();
      const upperPriceStr = upperPrice.toString();

      const priceLowerObj = tryParsePrice(
        tokens?.tokenA!,
        tokens?.tokenB!,
        lowerPriceStr
      );
      const priceUpperObj = tryParsePrice(
        tokens?.tokenA!,
        tokens?.tokenB!,
        upperPriceStr
      );

      let tickLower, tickUpper;

      const resolvedTickSpacing =
        poolFee !== 25000
          ? (TICK_SPACINGS[poolFee as keyof typeof TICK_SPACINGS] as number)
          : (tickSpace as number);
      tickLower = safePriceToClosestTick(
        priceLowerObj as unknown as Price<Token, Token>,
        tokens?.tokenA!,
        tokens?.tokenB!,
        resolvedTickSpacing
      );
      tickUpper = safePriceToClosestTick(
        priceUpperObj as unknown as Price<Token, Token>,
        tokens?.tokenA!,
        tokens?.tokenB!,
        resolvedTickSpacing
      );

      if (tickLower > tickUpper) {
        const tmp = tickLower;
        tickLower = tickUpper;
        tickUpper = tmp;
      }

      const nearestTickLower = nearestUsableTick(
        tickLower,
        resolvedTickSpacing
      );
      setCanonicalTickLower(nearestTickLower);

      const nearestTickUpper = nearestUsableTick(
        tickUpper,
        resolvedTickSpacing
      );

      setCanonicalTickUpper(nearestTickUpper);
    } else {
      if (isFullRangeSelected && tokens?.tokenA && tokens?.tokenB) {
        try {
          if (poolFee !== 25000) {
            tickSpacing = TICK_SPACINGS[
              poolFee as keyof typeof TICK_SPACINGS
            ] as number;
          } else {
            tickSpacing = Number(tickSpace);
          }

          let fullRangeLower = nearestUsableTick(
            TickMath.MIN_TICK,
            tickSpacing
          );

          let fullRangeUpper = nearestUsableTick(
            TickMath.MAX_TICK,
            tickSpacing
          );

          if (fullRangeLower > fullRangeUpper) {
            const tmp = fullRangeLower;
            fullRangeLower = fullRangeUpper;
            fullRangeUpper = tmp;
          }

          setCanonicalTickLower(fullRangeLower);
          setCanonicalTickUpper(fullRangeUpper);
          return;
        } catch (error) {
          console.error("Error computing full range canonical ticks", error);
        }
      }

      if (rangeSelectMinValue === 0 || rangeSelectMaxValue === 0) {
        return;
      }

      let _CPrice;

      if (poolAddress === null) {
        if (isInverted) {
          _CPrice = parseFloat(
            poolPriceWhenPoolNotInitialized?.invert().toSignificant(6) || "0"
          );
        } else {
          _CPrice = parseFloat(
            poolPriceWhenPoolNotInitialized?.toSignificant(6) || "0"
          );
        }
      } else {
        _CPrice = parseFloat(basePrice?.toSignificant(6) || "0");
      }

      let lowerPrice = _CPrice * rangeSelectMinValue;
      let upperPrice = _CPrice * rangeSelectMaxValue;

      const lowerPriceStr = lowerPrice.toString();
      const upperPriceStr = upperPrice.toString();

      let priceLowerObj, priceUpperObj;

      if (isInverted) {
        const pLow = tryParsePrice(
          tokens?.tokenB!,
          tokens?.tokenA!,
          lowerPriceStr
        );
        priceLowerObj = pLow?.invert();

        const pUp = tryParsePrice(
          tokens?.tokenB!,
          tokens?.tokenA!,
          upperPriceStr
        );
        priceUpperObj = pUp?.invert();
      } else {
        priceLowerObj = tryParsePrice(
          tokens?.tokenA!,
          tokens?.tokenB!,
          lowerPriceStr
        );
        priceUpperObj = tryParsePrice(
          tokens?.tokenA!,
          tokens?.tokenB!,
          upperPriceStr
        );
      }

      let tickLower, tickUpper;

      const resolvedTickSpacing =
        poolFee !== 25000
          ? (TICK_SPACINGS[poolFee as keyof typeof TICK_SPACINGS] as number)
          : (tickSpace as number);
      tickLower = safePriceToClosestTick(
        priceLowerObj as unknown as Price<Token, Token>,
        tokens?.tokenA!,
        tokens?.tokenB!,
        resolvedTickSpacing
      );
      tickUpper = safePriceToClosestTick(
        priceUpperObj as unknown as Price<Token, Token>,
        tokens?.tokenA!,
        tokens?.tokenB!,
        resolvedTickSpacing
      );

      if (tickLower > tickUpper) {
        const tmp = tickLower;
        tickLower = tickUpper;
        tickUpper = tmp;
      }

      const nearestTickLower = nearestUsableTick(
        tickLower,
        resolvedTickSpacing
      );
      setCanonicalTickLower(nearestTickLower);

      const nearestTickUpper = nearestUsableTick(
        tickUpper,
        resolvedTickSpacing
      );

      setCanonicalTickUpper(nearestTickUpper);
    }
  }, [
    poolAddress,
    rangeSelectMinValue,
    rangeSelectMaxValue,
    isFullRangeSelected,
    tokens,
    basePrice,
    poolFee,
    poolPriceWhenPoolNotInitialized,
    isInverted,
    inputAmount,
  ]);

  const viewPriceHandler = () => {
    setIsInverted(!isInverted);
    const token = currencyB;
    setCurrencyB(currencyA);
    setCurrencyA(token);
  };

  return (
    <>
      {currencyA && currencyB && (
        <div className="flex flex-row justify-end space-x-2 items-center">
          <Button
            onClick={viewPriceHandler}
            className="button-primary group !font-lato !font-normal flex justify-between items-center"
          >
            <ArrowRightLeft className="dark:text-[#000000] group-hover:text-primary" />
            <div className="dark:text-[#000000] group-hover:text-primary ">
              {currencyA?.symbol}
            </div>
          </Button>
        </div>
      )}
    </>
  );
};

export default ViewPriceButton;
