"use client";

import React, { useEffect, useMemo, useState } from "react";
import Header from "@/components/trading-live/Header";
import CoinTableNew from "@/components/trading-live/CoinTableNew";
import { useTradingLiveStore } from "@/store/tradinglive.store";

function TradingLiveView() {
  const { tableData } = useTradingLiveStore();

  return (
    <div className="flex flex-col space-y-6">
      <Header />
      <CoinTableNew tableData={tableData} />
    </div>
  );
}

export default TradingLiveView;
