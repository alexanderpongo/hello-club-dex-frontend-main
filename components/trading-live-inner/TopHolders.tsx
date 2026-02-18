"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@//components/ui/card";
import TopHoldersInfo from "@/components/trading-live-inner/TopHoldersInfo";
import { useTopHolders } from "@/hooks/useTopHolders";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface TopHoldersProps {
  tokenAddress: string;
  chainId: number;
}

const TopHolders: React.FC<TopHoldersProps> = ({ tokenAddress, chainId }) => {
  const [showAll, setShowAll] = useState(false);
  const { holders, isLoading, error, hasMore, loadMore, totalHolders } =
    useTopHolders({
      tokenAddress,
      chainId,
      limit: 10,
      enabled: !!tokenAddress && !!chainId,
    });

  const displayedHolders = showAll ? holders : holders.slice(0, 5);

  const handleViewMore = () => {
    if (!showAll) {
      setShowAll(true);
    } else if (hasMore) {
      loadMore();
    }
  };

  return (
    <Card className="w-full bg-white dark:bg-[#0E0E10] border border-white/10  flex flex-col items-center justify-center p-5 space-y-3">
      <div className="w-full flex justify-between items-center px-2">
        <div className="font-formula text-primary text-[32px]">TOP HOLDERS</div>
        <div className="font-lato text-gray-500 dark:text-white/70 text-xs">
          {isLoading && totalHolders === 0
            ? "Loading..."
            : totalHolders !== null &&
              `${totalHolders.toLocaleString()} holders`}
        </div>
      </div>

      {isLoading && totalHolders === 0 ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-500 dark:text-[#ADFF2F]" />
        </div>
      ) : (
        <>
          {displayedHolders.map((holder, index) => (
            <TopHoldersInfo
              key={holder.owner_address}
              rank={index + 1}
              address={holder.owner_address}
              balance={holder.balance_formatted}
              percentage={holder.percentage_relative_to_total_supply || 0}
              chainId={chainId}
            />
          ))}

          {holders.length > 5 && (
            <div className="w-full">
              <Button
                className="w-full button-primary uppercase"
                onClick={handleViewMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Loading...
                  </>
                ) : showAll && hasMore ? (
                  "Load More Holders"
                ) : !showAll ? (
                  "View More Holders"
                ) : (
                  "All Holders Loaded"
                )}
              </Button>
            </div>
          )}

          {holders.length === 0 && !isLoading && !error && (
            <div className="text-gray-500 dark:text-white/50 text-sm py-4">
              No holders found
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default TopHolders;
