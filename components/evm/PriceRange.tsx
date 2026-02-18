import React from "react";
import ViewPriceButton from "./ViewPriceButton";
import PriceChart from "./PriceChart";
import MinPriceCard from "./MinPriceCard";
import MaxPriceCard from "./MaxPriceCard";
import PriceRangeButtons from "./PriceRangeButtons";
import AddLPButton from "./AddLPButton";

const PriceRange = () => {
  return (
    <div className="flex flex-col">
      <div className="pt-5 md:pt-0 flex flex-row justify-start">
        <div className="uppercase text-primary font-formula text-base">
          Set Price Range
        </div>
      </div>
      {/* <ViewPriceButton /> */}
      <PriceChart />
      <div className="py-1 flex flex-row justify-between columns-2 w-full space-x-2">
        <MinPriceCard />
        <MaxPriceCard />
      </div>
      <div>
        <PriceRangeButtons />
      </div>
      <div>
        <AddLPButton />
      </div>
    </div>
  );
};

export default PriceRange;
