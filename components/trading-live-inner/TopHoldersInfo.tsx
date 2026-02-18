import { ExternalLink } from "lucide-react";
import React from "react";
import { Progress } from "@/components/ui/progress";

interface TopHoldersInfoProps {
  rank: number;
  address: string;
  balance: string;
  percentage: number;
  chainId: number;
}

const SCANNER_URLS: Record<number, string> = {
  1: "https://etherscan.io",
  56: "https://bscscan.com",
  8453: "https://basescan.org",
  97: "https://testnet.bscscan.com",
};

const formatAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

const formatBalance = (balance: string) => {
  const num = parseFloat(balance);
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(2);
};

const TopHoldersInfo: React.FC<TopHoldersInfoProps> = ({
  rank,
  address,
  balance,
  percentage,
  chainId,
}) => {
  const scannerUrl = SCANNER_URLS[chainId] || SCANNER_URLS[56];
  const explorerLink = `${scannerUrl}/address/${address}`;

  const handleExternalLinkClick = () => {
    window.open(explorerLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-flex-col w-full space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="text-gray-800 dark:text-white/90 text-sm font-lato">
            #{rank}
          </div>
          <div className="text-gray-800 dark:text-white/90 text-sm font-lato">
            {formatAddress(address)}
          </div>
        </div>
        <div
          onClick={handleExternalLinkClick}
          className="cursor-pointer hover:text-green-500 dark:hover:text-[#ADFF2F] transition-colors"
        >
          <ExternalLink
            size={16}
            className="text-gray-500 dark:text-[#6B7280]"
          />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-gray-600 dark:text-white/70 text-xs font-bold font-lato">
          {formatBalance(balance)}
        </div>
        <div className="text-gray-800 dark:text-white/90 text-sm">
          {percentage ? percentage.toFixed(2) : "0.00"}%
        </div>
      </div>
      <div>
        <Progress
          value={percentage || 0}
          className="h-2 rounded-full bg-gray-200 dark:bg-white/10"
        />
      </div>
    </div>
  );
};

export default TopHoldersInfo;
