import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

const PriceRangeTabs = () => {
  return (
    <div className="w-full flex py-3 pb-14">
      <Tabs
        defaultValue="full"
        className="bg-white/5 ring-1 ring-inset ring-white/5 rounded-sm w-full h-[40px] mb-2"
      >
        <TabsList className="bg-black/10 dark:bg-white/5 rounded-sm w-full h-[40px] mb-2">
          <TabsTrigger
            value="full"
            className="w-full h-[40px] navbar-text uppercase"
          >
            Full Range
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="w-full h-[40px] navbar-text uppercase"
          >
            Custom Range
          </TabsTrigger>
        </TabsList>
        <TabsContent value="full">
          <div className="">
            <p className="text-sm text-neutral-400 font-lato font-normal">
              Providing full range liquidity ensures continuous market
              participation across all possible
              <br /> prices, offering simplicity but with potential for higher
              impermanent loss.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="custom">
          <div className="">
            <p className="text-sm text-neutral-400 font-lato font-normal">
              Custom range allows you to concentrate your liquidity within
              specific price bounds,
              <br /> enhancing capital efficiency and fee earnings but requiring
              more active management.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PriceRangeTabs;
