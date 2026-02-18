import React from "react";
import { FeeTier } from "@/interfaces/index.i";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";
import { CircleCheck } from "lucide-react";

interface LPFeeTierCardProps {
  fee: FeeTier;
}

const LPFeeTierCard: React.FC<LPFeeTierCardProps> = (props) => {
  const { fee } = props;
  const { feeTier, setFeeTier, setTickSpace, setPoolFee } =
    useLiquidityPoolStore();

  const feeHandler = (fee: number, value: number) => {
    setFeeTier(fee.toString());
    setTickSpace(value);
    setPoolFee(fee * 10000);
  };

  return (
    <div
      onClick={() => feeHandler(fee.fee, fee.value)}
      className={`flex flex-col w-full flex-grow p-3 rounded-xl border transition-all hover:cursor-pointer space-y-1 ${feeTier === fee.fee.toString()
          ? "bg-[#C2FE0C26] border-[#C2FE0C2E] text-primary"
          : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 dark:text-white"
        } `}
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-medium inline-flex justify-start items-center">
          {fee.fee}%
        </div>
        {feeTier === fee.fee.toString() && <CircleCheck className="h-4 w-4" />}
      </div>

      <p className="text-xs dark:text-[#ffffff] font-lato font-normal justify-start">
        {fee.desp}
      </p>
      <p className="text-xs dark:text-[#a1a1a1] font-lato font-normal justify-start">
        {fee.desp1}
      </p>
    </div>
  );
};

export default LPFeeTierCard;
