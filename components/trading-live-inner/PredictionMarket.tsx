import React, { useEffect, useState } from "react";
import { Card } from "../ui/card";
import { Clock, TrendingDown, TrendingUp, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/custom-progress";
import { GrLinkNext } from "react-icons/gr";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Button } from "../ui/button";
import { useAccount, useConfig } from "wagmi";
import { Address, formatUnits, erc20Abi } from "viem";
import { readContract } from "@wagmi/core";
import {
  GET_USER_VOTE_FOR_PREDICTION_QUERY,
  predictionMarketGraphqlClient,
  GET_TOP_PREDICTION_QUERY,
} from "@/lib/actions/tradinglive.subgraph.actions";
import { Skeleton } from "../ui/skeleton";
import { useRouter } from "next/navigation";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  usePredictionVoteStats,
  formatVoteStats,
} from "@/hooks/usePredictionVoteStats";
import { useSubmitVote } from "@/hooks/useSubmitVote";

const HELLO_ADDRESS = "0x3B86588F12B3C9b7D1B62ea78480C6fb3477C63A";
const HELLO_DECIMALS = 18;

interface Prediction {
  id: string;
  title: string;
  predictionVotes: string;
  upvotes: string;
  downvotes: string;
  yesVotes: string;
  noVotes: string;
  endTime: string;
}

interface PredictionResponse {
  predictions: Prediction[];
}

const PredictionMarket = () => {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const [usdtBalance, setUsdtBalance] = useState<string>("0");
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [betAmount, setBetAmount] = useState<number | "">("");
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeVoteButton, setActiveVoteButton] = useState<"yes" | "no" | null>(
    null
  ); // Track which button was clicked
  const router = useRouter();
  const { openConnectModal } = useConnectModal();

  const {
    voteStats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats,
  } = usePredictionVoteStats({
    predictionId: prediction?.id,
    enabled: !!prediction?.id,
    tokenDecimals: HELLO_DECIMALS,
  });

  const {
    submitYesVote,
    submitNoVote,
    isSubmitting,
    isApproving,
    submissionStep,
    statusMessage,
    error: voteError,
    transactionHash,
  } = useSubmitVote({
    predictionId: prediction?.id || "0",
    tokenAddress: HELLO_ADDRESS,
    tokenDecimals: HELLO_DECIMALS,
    userBalance: usdtBalance,
    onSuccess: (hash) => {
      refetchStats();

      fetchUsdtBalance();
      setBetAmount("");
      setActiveVoteButton(null);
    },
    onError: (error) => {
      console.error("Vote submission failed:", error);
      setActiveVoteButton(null);
    },
  });

  const fetchUsdtBalance = async () => {
    if (!address || !chainId) {
      setUsdtBalance("0");
      return;
    }

    setIsBalanceLoading(true);
    try {
      const balance = await readContract(config, {
        address: HELLO_ADDRESS as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        chainId: chainId,
        args: [address],
      });

      const formattedBalance = formatUnits(balance, HELLO_DECIMALS);

      const numBalance = parseFloat(formattedBalance);
      setUsdtBalance(
        numBalance.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } catch (error) {
      console.error("Error fetching USDT balance:", error);
      setUsdtBalance("0");
    } finally {
      setIsBalanceLoading(false);
    }
  };

  useEffect(() => {
    fetchUsdtBalance();
  }, [address, chainId]);

  // Fetch prediction data
  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current Unix epoch timestamp
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const variables = {
          where: {
            endTime_gt: currentTimestamp.toString(),
          },
        };

        const data =
          await predictionMarketGraphqlClient.request<PredictionResponse>(
            GET_TOP_PREDICTION_QUERY,
            variables
          );

        if (data.predictions && data.predictions.length > 0) {
          setPrediction(data.predictions[0]);
        } else {
          setPrediction(null);
        }
      } catch (err) {
        console.error("Error fetching prediction:", err);
        setError("Failed to load prediction data");
        setPrediction(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  // Calculate percentages and remaining time
  const calculateData = () => {
    if (!prediction) {
      return {
        totalSwim: 0,
        totalSink: 0,
        swimPercentage: 0,
        sinkPercentage: 0,
        timeRemaining: "0h 0m",
      };
    }

    const totalSwim = parseInt(prediction.yesVotes) || 0;
    const totalSink = parseInt(prediction.noVotes) || 0;
    const totalBets = totalSwim + totalSink;

    const swimPercentage =
      totalBets > 0 ? Math.round((totalSwim / totalBets) * 100) : 0;
    const sinkPercentage = 100 - swimPercentage;

    // Calculate time remaining
    const endTime = parseInt(prediction.endTime);
    const currentTime = Math.floor(Date.now() / 1000);
    const remainingSeconds = Math.max(0, endTime - currentTime);

    const days = Math.floor(remainingSeconds / 86400);
    const hours = Math.floor((remainingSeconds % 86400) / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);

    let timeRemaining = "";

    if (days > 0) {
      timeRemaining = `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      timeRemaining = `${hours}h ${minutes}m`;
    } else {
      timeRemaining = `${minutes}m`;
    }

    return {
      totalSwim,
      totalSink,
      swimPercentage,
      sinkPercentage,
      timeRemaining,
    };
  };

  const {
    totalSwim,
    totalSink,
    swimPercentage,
    sinkPercentage,
    timeRemaining,
  } = calculateData();

  const handleClick = () => {
    // Navigate to prediction market page
    router.push("/prediction-market");
  };

  useEffect(() => {
    async function fetchUserVote() {
      if (prediction?.id && address) {
        const variables = { predictionId: prediction.id, voter: address };
        const data = await predictionMarketGraphqlClient.request(
          GET_USER_VOTE_FOR_PREDICTION_QUERY,
          variables
        );
      }
    }
    fetchUserVote();
  }, [prediction?.id, address]);

  return (
    <Card className="w-full bg-white dark:bg-[#0E0E10] border-none flex flex-col  items-center justify-center p-5 space-y-3">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4 bg-gray-700" />
          <Skeleton className="h-6 w-full bg-gray-700" />
          <Skeleton className="h-2 w-full bg-gray-700" />
          <Skeleton className="h-4 w-1/2 bg-gray-700" />
          <Skeleton className="h-2 w-full bg-gray-700" />
          <Skeleton className="h-4 w-1/2 bg-gray-700" />
          <div className="flex justify-center mt-4">
            <Skeleton className="h-10 w-32 bg-gray-700" />
          </div>
        </div>
      ) : !prediction ? (
        // No active prediction
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <TrendingUp size={48} className="text-primary" />
          </div>
          <p className="text-primary text-sm font-medium mb-2">
            No Active Predictions
          </p>
          <p className="text-primary text-xs">
            Check back later for new community predictions
          </p>
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => handleClick()}
              className="button-primary flex items-center"
            >
              <GrLinkNext size={14} className="mr-1" /> View All Predictions
            </Button>
          </div>
        </div>
      ) : (
        // Active prediction display
        <>
          <div className="flex justify-start w-full">
            <div className="text-[#ADFF2F] text-[18px] font-formula leading-7 font-light uppercase text-left">
              {prediction.title}
            </div>
          </div>
          <div className="w-full flex justify-between items-center text-[#9CA3AF]">
            <div className="text-sm uppercase">Community Sentiment</div>
            <div className="text-xs flex items-center gap-1">
              <Clock size={12} /> Ends in {timeRemaining}
            </div>
          </div>
          <div className="flex flex-col w-full space-y-2">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1">
                <TrendingUp color="#4ADE80" size={16} />
                <div className="text-sm text-[#4ADE80]">YES</div>
              </div>
              {voteStats ? (
                <div className="text-sm text-[#4ADE80] font-lato font-bold">
                  {voteStats.yesPercentage}%
                </div>
              ) : null}
            </div>
            <div className="w-full">
              <Progress
                value={voteStats ? voteStats.yesPercentage : swimPercentage}
                className="h-2 rounded-full bg-white/5"
                indicatorColor="#4ADE80"
              />
              <div className="flex justify-between items-center w-full text-xs text-[#9CA3AF] mt-3">
                <div>
                  {voteStats ? voteStats.totalYesVotes : totalSwim} Hello total
                  bets
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1">
                <TrendingDown color="#F87171" size={16} />
                <div className="text-sm text-[#F87171]">NO</div>
              </div>
              {voteStats ? (
                <div className="text-sm text-[#F87171] font-lato font-bold">
                  {voteStats.noPercentage}%
                </div>
              ) : null}
            </div>
            <div className="w-full">
              <Progress
                value={voteStats ? voteStats.noPercentage : sinkPercentage}
                className="h-2 rounded-full bg-white/5"
                indicatorColor="#F87171"
              />
              <div className="flex justify-between items-center w-full text-xs text-[#9CA3AF] mt-3">
                <div>
                  {voteStats ? voteStats.totalNoVotes : totalSink} Hello total
                  bets
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-b border-white/10 w-full">
            <div className="flex justify-between mt-4">
              <div className="text-white/70 text-sm font-lato">
                YOUR BALANCE
              </div>
              <div className="text-white/90 text-sm font-lato flex items-center gap-2">
                {isBalanceLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    {address ? (
                      `${usdtBalance} HELLO`
                    ) : (
                      <Button
                        className="w-full button-primary uppercase h-10 font-lato"
                        onClick={openConnectModal}
                      >
                        Connect Wallet
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="flex justify-between my-4">
              <div className="text-white/70 text-sm font-lato uppercase">
                Bet Amount
              </div>
              <button
                className="text-[#ADFF2F] text-sm font-lato cursor-pointer hover:text-[#9FEF00] transition-colors"
                onClick={() => {
                  if (address && usdtBalance && usdtBalance !== "0") {
                    const cleanBalance = usdtBalance.replace(/,/g, "");
                    const balanceNum = parseFloat(cleanBalance);
                    if (!isNaN(balanceNum)) {
                      setBetAmount(balanceNum);
                    }
                  }
                }}
                disabled={!address || isSubmitting}
              >
                use max
              </button>
            </div>
            <InputGroup className="border-white/10 rounded px-2 py-5 h-10 focus-visible:ring-0 mb-4">
              <InputGroupInput
                placeholder="Enter Bet Amount"
                className="focus-visible:ring-0 placeholder:text-[16px]"
                value={betAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || !isNaN(Number(value))) {
                    const numValue = value === "" ? "" : Number(value);

                    const maxBalance = parseFloat(
                      usdtBalance.replace(/,/g, "")
                    );

                    if (numValue === "" || numValue <= maxBalance) {
                      setBetAmount(numValue);
                    }
                  }
                }}
                type="text"
                disabled={isSubmitting}
              />
              <InputGroupAddon align="inline-end">
                <div className="text-[#9CA3AF] text-sm font-lato">HELLO</div>
              </InputGroupAddon>
            </InputGroup>
            <div className="flex items-center justify-between gap-2 pb-4">
              <Button
                className="w-full border border-[#22C55E]/50 bg-[#22C55E]/20 text-[#4ADE80] text-sm rounded-full uppercase"
                variant={"outline"}
                onClick={() => {
                  if (!address) {
                    openConnectModal?.();
                    return;
                  }
                  if (betAmount === "" || betAmount <= 0) {
                    return;
                  }
                  setActiveVoteButton("yes");
                  submitYesVote(betAmount.toString());
                }}
                disabled={
                  isSubmitting || betAmount === "" || betAmount <= 0 || !address
                }
              >
                {activeVoteButton === "yes" && isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Approving...
                  </>
                ) : activeVoteButton === "yes" &&
                  isSubmitting &&
                  submissionStep === "voting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Voting...
                  </>
                ) : (
                  <>
                    <TrendingUp size={16} color="#4ADE80" />
                    YES
                  </>
                )}
              </Button>
              <Button
                className="w-full border border-[#EF4444]/30 bg-[#EF4444]/10 text-[#F87171] text-sm rounded-full uppercase"
                variant={"outline"}
                onClick={() => {
                  if (!address) {
                    openConnectModal?.();
                    return;
                  }
                  if (betAmount === "" || betAmount <= 0) {
                    return;
                  }
                  setActiveVoteButton("no");
                  submitNoVote(betAmount.toString());
                }}
                disabled={
                  isSubmitting || betAmount === "" || betAmount <= 0 || !address
                }
              >
                {activeVoteButton === "no" && isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Approving...
                  </>
                ) : activeVoteButton === "no" &&
                  isSubmitting &&
                  submissionStep === "voting" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Voting...
                  </>
                ) : (
                  <>
                    <TrendingDown size={16} color={"#F87171"} />
                    NO
                  </>
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-start mt-4 w-full">
            <div className="text-white/70 text-sm font-lato uppercase w-full">
              Your Active Predictions
            </div>
          </div>
          <div className="w-full flex justify-between items-center bg-[#0F0F0F] border border-white/5 rounded-[12px] p-4">
            <div className="text-[#4ADE80] text-sm font-lato flex items-center gap-2 ">
              <TrendingUp size={16} color="#4ADE80" />
              YES
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-white/90 text-sm">1250 HELLO</div>
            </div>
          </div>
          <div className="w-full flex justify-between items-center bg-[#0F0F0F] border border-white/5 rounded-[12px] p-4">
            <div className="text-[#F87171] text-sm font-lato flex items-center gap-2 ">
              <TrendingDown size={16} color="#F87171" />
              NO
            </div>
            <div className="flex flex-col space-y-2">
              <div className="text-white/90 text-sm">1250 HELLO</div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default PredictionMarket;
