"use client";
import React from "react";
import { FullBondsView, ChainId } from "@ape.swap/bonds-sdk";
import "@ape.swap/bonds-sdk/dist/styles.css";
import "swiper/swiper.min.css";
import { useTheme } from "next-themes";

const ApeBondsComp = () => {
  const { theme } = useTheme();
  const referenceId = process.env.NEXT_PUBLIC_REFERENCE_ID as string;

  const isDark = theme === "dark";

  return (
    <FullBondsView
      referenceId={referenceId}
      chains={[
        ChainId.BSC,
        ChainId.MAINNET,
      ]}
      connector="rainbowkit"
      useHotBonds={false}
      theme={{
        radii: "10px",
        customFont: "Lato",
        colors: isDark ? {
          primaryButton: "#C2FE0C",
          white1: "#050505",
          white2: "#0D0E0D",
          white3: "#161716",
          white4: "#1F211F",
          white5: "#2A2D2A",
          text: "#FFFFFF",
          primaryBright: "#000000",
        } : {
          primaryButton: "#C2FE0C",
          white1: "#FFFFFF",
          white2: "#F9FAF9",
          white3: "#F1F2F1",
          white4: "#E9EBE9",
          white5: "#DDE0DD",
          text: "#000000",
          primaryBright: "#FFFFFF",
        },
      }}
    />
  );
};

export default ApeBondsComp;
