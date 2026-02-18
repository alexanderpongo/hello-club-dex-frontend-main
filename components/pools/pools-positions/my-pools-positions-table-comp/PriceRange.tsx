import { Progress } from "@/components/ui/custom-progress";
import { PriceRange } from "@/types/lp-page.types";
import React, { useMemo } from "react";

interface PriceRangeCompProps {
  price_range: PriceRange;
}

const MINTICK = -887200;
const MAXTICK = 887200;

const PriceRangeComp: React.FC<PriceRangeCompProps> = (props) => {
  const { price_range } = props;

  const progressValue = useMemo(() => {
    const lower = Number(price_range?.tick_lower ?? 0);
    const upper = Number(price_range?.tick_upper ?? 0);
    const current = Number(price_range.tick_current ?? 0);

    if (!isFinite(lower) || !isFinite(upper) || !isFinite(current)) return 0;

    // Normalize in case bounds are swapped
    const min = Math.min(lower, upper);
    const max = Math.max(lower, upper);
    const range = max - min;

    if (range === 0) {
      // Degenerate range: if current >= bound treat as 100, else 0
      return current >= max ? 100 : 0;
    }

    // Orientation: show progress as distance from upper bound (so at lower -> 100, at upper -> 0)
    const pctFromUpper = ((max - current) / range) * 100;

    return Math.max(0, Math.min(100, pctFromUpper));
  }, [price_range]);

  return (
    <div className="flex justify-end w-full">
      <div className="flex flex-col gap-2 w-[150px] relative">
        {!price_range.in_range && (
          <div className="text-[10px] font-semibold text-red-500 bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-center uppercase tracking-wide absolute top-0 z-10 right-0 left-0">
            Out of range
          </div>
        )}
        <div
          className={`flex justify-between text-[10px] text-gray-400 font-lato ${
            !price_range.in_range ? "blur-[1px] opacity-20" : ""
          }`}
        >
          {price_range.tick_lower === MINTICK &&
          price_range.tick_upper === MAXTICK ? (
            <>
              <div>{`0`}</div>
              <div>{`∞`}</div>
            </>
          ) : (
            <>
              <div>
                {price_range.token1_per_token0.price_lower > 1 ? (
                  <>{price_range.token1_per_token0.price_lower.toFixed(2)}</>
                ) : (
                  <>{price_range.token1_per_token0.price_lower.toFixed(8)}</>
                )}
              </div>
              <div>
                {price_range.token1_per_token0.price_upper > 1 ? (
                  <>{price_range.token1_per_token0.price_upper.toFixed(2)}</>
                ) : (
                  <>{price_range.token1_per_token0.price_upper.toFixed(8)}</>
                )}
              </div>
            </>
          )}
        </div>
        <div
          className={`${!price_range.in_range ? "blur-3xl opacity-10" : ""}`}
        >
          <Progress
            value={progressValue}
            className="h-2 rounded-full dark:bg-white/5 bg-black/20"
            indicatorColor="#ADFF2F"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceRangeComp;
