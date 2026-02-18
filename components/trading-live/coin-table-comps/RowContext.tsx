"use client";

import React, { createContext, useContext, useState } from "react";

export type RowContextType = {
  finalPriceUSD: number | null;
  setFinalPriceUSD: (price: number | null) => void;
};

const RowContext = createContext<RowContextType | undefined>(undefined);

export const RowProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [finalPriceUSD, setFinalPriceUSD] = useState<number | null>(null);

  return (
    <RowContext.Provider value={{ finalPriceUSD, setFinalPriceUSD }}>
      {children}
    </RowContext.Provider>
  );
};

// Optional consumer: returns undefined if used outside a provider
export function useOptionalRowContext() {
  return useContext(RowContext);
}

// Strict consumer: throws if used outside a provider (useful for required usage)
export function useRowContext() {
  const ctx = useOptionalRowContext();
  if (!ctx) throw new Error("useRowContext must be used within a RowProvider");
  return ctx;
}

export default RowContext;
