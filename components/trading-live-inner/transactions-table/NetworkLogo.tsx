import React from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

interface NetworkLogoProps {
  chainId: number;
}

const getLogoSrc = (chainId: number, theme: string | undefined) => {
  const themeSuffix = theme === "dark" ? "light" : "dark";
  switch (chainId) {
    case 1:
      return `/scanners/etherscan-logo-circle-${themeSuffix}.svg`;
    case 56:
      return `/scanners/bsc-logo-${themeSuffix}.svg`;
    case 8453:
      return `/scanners/base-logo-symbol-${themeSuffix}.svg`;
    case 97:
      return `/scanners/bsc-logo-${themeSuffix}.svg`; // Testnet BSC
    default:
      return "";
  }
};

const NetworkLogo: React.FC<NetworkLogoProps> = ({ chainId }) => {
  const { theme } = useTheme();
  const src = getLogoSrc(chainId, theme);

  if (!src) {
    return null;
  }

  return <Image src={src} alt="Network Logo" width={20} height={20} />;
};

export default NetworkLogo;
