"use client";
import React, { useEffect, useState } from "react";
// import { Card } from "../ui/card"; /
import Image from "next/image";
import {
  ChevronDown,
  ChevronUp,
  Clock4,
  Loader2,
  LockOpen,
} from "lucide-react";
import LockDetailsDialog from "./LockDetailsDialog";
import Link from "next/link";
import { Address, Chain, erc20Abi } from "viem";
import { differenceInDays, format } from "date-fns";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount, useConfig } from "wagmi";
import { readContract, waitForTransaction, writeContract } from "@wagmi/core";
import { toast } from "react-toastify";
import { Button } from "../ui/button";
import CountdownTimer from "../CountDown";
import { usePosition } from "@/hooks/usePositions";

type LpLockType = {
  id: string;
  owner: string;
  tokenId: string;
  blockNumber: string;
  blockTimestamp: string;
  transactionHash: string;
  unlockTime: string;
  duration?: string;
  token0Symbol?: string;
  token1Symbol?: string;
  pair?: string;
};

interface MyLockDetailsCardProps {
  details: LpLockType;
  chain: Chain;
  isRefetch: boolean;
  setIsRefetch: (value: boolean) => void;
}

const MyLockCard: React.FC<MyLockDetailsCardProps> = ({
  details,
  chain,
  isRefetch,
  setIsRefetch,
}) => {
  const config = useConfig();
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [duration, setDuration] = useState<Number>(0);
  const [token1Address, setToken1Address] = useState<string>("");
  const [token2Address, setToken2Address] = useState<string>("");
  const [token1Name, setToken1Name] = useState<string>("");
  const [token2Name, setToken2Name] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch position data from API
  const {
    data: positionData,
    isLoading: isPositionLoading,
    error: positionError,
  } = usePosition(chain?.id, details.tokenId, {
    enabled: !!chain?.id && !!details.tokenId && !details.id?.startsWith("demo-"),
  });

  const chainContractConfig: ContractConfigItemType =
    contractConfig[chain?.id || "default"];

  const getPositionsOfNftId = async () => {
    type PositionsType = [string, string, string, ...any[]];
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chain?.id || "default"];

      const positions = (await readContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as Address,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "positions",
        chainId: chain?.id || 56,
        args: [details.tokenId],
      })) as PositionsType;

      setToken1Address(positions[2]);
      setToken2Address(positions[3]);
    } catch (error) {
      setToken1Address("");
      setToken2Address("");
      console.error("Error while fetch positions of token id", error);
    }
  };

  useEffect(() => {
    if (details.tokenId) {
      getPositionsOfNftId();
    }
  }, [details.tokenId]);

  const getTokenSymbol = async (address: string) => {
    try {
      const symbol = await readContract(config, {
        address: address as Address,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: chain?.id || 56,
        args: [],
      });

      return symbol;
    } catch (error) {
      console.error("Error while get token name", error);
    }
  };

  const getTokensSymbols = async () => {
    const name1 = await getTokenSymbol(token1Address);
    const name2 = await getTokenSymbol(token2Address);
    setToken1Name(name1!);
    setToken2Name(name2!);
    details.pair = name1 + "/" + name2;
  };

  useEffect(() => {
    if (token1Address && token2Address) {
      getTokensSymbols();
    }
  }, [token1Address, token2Address]);

  useEffect(() => {
    const timestamp1 = Number(details.blockTimestamp) * 1000; // convert to ms
    const timestamp2 = Number(details.unlockTime) * 1000; // convert to ms

    const daysDiff = differenceInDays(
      new Date(timestamp2),
      new Date(timestamp1)
    );
    setDuration(daysDiff);
    details.duration = daysDiff.toString();
  }, []);

  const ChainImage = () => {
    switch (chain?.id) {
      case 56:
        return (
          <Image
            src={"/chain-icons/bnb.svg"}
            alt={chain?.name || "BNB"}
            height={0}
            width={0}
            sizes="100vw"
            className="rounded-full h-4 w-4"
          />
        );
        break;

      case 97:
        return (
          <Image
            src={"/chain-icons/bnb.svg"}
            alt={chain?.name || "BNB"}
            height={0}
            width={0}
            sizes="100vw"
            className="w-4 h-4 filter grayscale rounded-full"
          />
        );
        break;

      case 1:
        return (
          <Image
            src={"/chain-icons/ethereum-eth.svg"}
            alt={chain?.name || "Ethereum"}
            height={0}
            width={0}
            sizes="100vw"
            className="rounded-full h-4 w-4"
          />
        );
        break;

      default:
        return (
          <Image
            src={"/chain-icons/ethereum-eth.svg"}
            alt={"ethereum"}
            height={0}
            width={0}
            sizes="100vw"
            className="rounded-full h-4 w-4"
          />
        );
        break;
    }
  };

  const detailsHandler = () => {
    setIsOpen((prevState) => !prevState);
  };

  // Helper function to format numbers
  const formatNumber = (
    value: number | string | undefined,
    isUsd: boolean = false
  ): string => {
    if (!value || Number(value) === 0) return isUsd ? "0.00" : "0";
    const num = Number(value);

    // Handle very small numbers - avoid scientific notation
    if (num < 0.000001 && num > 0) {
      // For extremely small USD values, just show as 0.00
      if (isUsd) {
        return "< 0.000001";
      }
      // For token amounts, show with more decimal places (up to 12 to avoid scientific notation)
      // But if still too small, just show 0
      if (num < 0.000000000001) {
        return "0";
      }
      // Show up to 12 decimal places for small token amounts
      return num.toFixed(12).replace(/\.?0+$/, "");
    }

    // For regular numbers, use locale formatting
    return num.toLocaleString(undefined, {
      minimumFractionDigits: isUsd ? 2 : 0,
      maximumFractionDigits: isUsd ? 6 : 8,
    });
  };

  const handleUnlock = async () => {
    setIsLoading(true);

    try {
      const hash = await writeContract(config, {
        address: chainContractConfig.v3LpLockerAddress as Address,
        abi: chainContractConfig.v3LpLockerABI,
        functionName: "unlockPosition",
        args: [details.tokenId],
        chainId: chain?.id || 56,
      });

      const data = await waitForTransaction(config, {
        hash: hash,
      });

      // console.log("unlock data", data);

      if (data?.status == "success") {
        toast.success(
          <div>
            <p>Successfully locked</p>
            <Link
              href={`${chainContractConfig?.explorerURL}/tx/${data?.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="text-slate text-sm underline"
            >
              See Transaction
            </Link>
          </div>,
          {
            toastId: "unlock-lp",
          }
        );
      }
    } catch (error) {
      console.error("Error while unlock LP", error);
    } finally {
      setIsRefetch(!isRefetch);
      setIsLoading(false);
    }
  };


  return (
    <div className="group relative overflow-hidden dark:bg-[#151515] bg-white p-5 w-full rounded-xl border border-black/5 dark:border-white/10 transition-all duration-300">
      <div className="flex flex-col w-full relative z-10">
        <div className="flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4">

          {/* Token Info Section */}
          <div className="flex items-center gap-4">
            <div className="relative flex items-center h-12 w-16">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-800 border-2 border-[#151515] flex items-center justify-center overflow-hidden z-20">
                <Image
                  src={details.token0Symbol === "WBNB" ? "/chain-icons/bnb.svg" : "/chain-icons/ethereum-eth.svg"}
                  alt="token0" width={40} height={40} className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-700 border-2 border-[#151515] flex items-center justify-center overflow-hidden z-10">
                <Image
                  src={details.token1Symbol === "USDT" ? "/chain-icons/bnb.svg" : "/chain-icons/ethereum-eth.svg"}
                  alt="token1" width={40} height={40} className="w-full h-full object-cover grayscale opacity-80"
                />
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-formula font-medium dark:text-white uppercase">
                  {(token1Name || details.token0Symbol) ? (
                    <>
                      {token1Name || details.token0Symbol} / {token2Name || details.token1Symbol}
                    </>
                  ) : (
                    "Unknown Pair"
                  )}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 dark:text-[#a3a3a3] font-lato uppercase tracking-wider">
                <ChainImage />
                <span>{chain?.id == 97 ? "Binance Testnet" : chain?.name || "BNB Chain"}</span>
              </div>
            </div>
          </div>

          {/* Status and Actions Section */}
          <div className="flex items-center justify-between w-full md:w-auto gap-2 md:gap-4">
            {/* Status Pill */}
            <div className="flex items-center bg-black/5 dark:bg-white/5 px-2 md:px-4 h-10 rounded-lg border border-black/5 dark:border-white/10 flex-1 md:flex-none justify-between md:justify-start">
              <div className="flex items-center gap-1.5 md:gap-2 mr-2 md:mr-4">
                <span className={`w-1.5 h-1.5 rounded-full ${Number(details.unlockTime) * 1000 > Date.now() ? "bg-orange-500" : "bg-primary"}`} />
                <span className="text-[10px] md:text-xs font-bold text-white uppercase whitespace-nowrap">
                  {Number(details.unlockTime) * 1000 > Date.now() ? "Locked" : "Unlocked"}
                </span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center ml-2 md:ml-4">
                <span className="text-[10px] md:text-xs font-formula text-primary whitespace-nowrap">
                  <CountdownTimer
                    endTime={Number(details.unlockTime)}
                    withBrackets={false}
                  />
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LockDetailsDialog
                chain={chain}
                details={details}
                isRefetch={isRefetch}
                setIsRefetch={setIsRefetch}
                duration={duration.toString()}
              />

              <button
                onClick={detailsHandler}
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg transition-all ${isOpen ? "bg-primary text-black" : "bg-white/5 dark:bg-[#1f1f1f] text-gray-400 hover:text-white border border-white/10"}`}
              >
                {isOpen ? <ChevronUp className="h-4 w-4 md:h-5 md:w-5" /> : <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="mt-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Lock ID</div>
                <div className="text-sm dark:text-white">
                  {details.tokenId}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Created On</div>
                <div className="text-sm dark:text-white">
                  {details.blockTimestamp
                    ? format(
                      new Date(Number(details.blockTimestamp) * 1000),
                      "PPP"
                    )
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">
                  Lock Duration
                </div>
                <div className="text-sm dark:text-white">
                  {duration.toString()} Days
                </div>
              </div>
            </div>

            {/* Position Liquidity Information */}
            {positionData && (
              <div className="mt-4 pt-4 border-t border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                <div className="text-sm text-gray-400 mb-3">
                  Position Liquidity
                </div>

                {/* Grid layout: 3 columns on large screens, 1 column on mobile */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Originally Deposited */}
                  <div className="lg:border-r lg:border-black/10 dark:border-[rgba(255,255,255,0.03)] lg:pr-4">
                    <div className="text-xs text-gray-500 mb-2">
                      Originally Deposited
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {positionData?.pool?.token0?.symbol}:
                        </span>
                        <span className="text-sm dark:text-white font-medium">
                          {formatNumber(
                            positionData?.liquidity?.original_deposited
                              ?.token0
                          )}{" "}
                          {positionData?.pool?.token0?.symbol}{" "}
                          <span className="text-gray-400">
                            $
                            {formatNumber(
                              positionData?.liquidity?.original_deposited
                                ?.token0_usd,
                              true
                            )}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {positionData?.pool?.token1?.symbol}:
                        </span>
                        <span className="text-sm dark:text-white font-medium">
                          {formatNumber(
                            positionData?.liquidity?.original_deposited
                              ?.token1
                          )}{" "}
                          {positionData?.pool?.token1?.symbol}{" "}
                          <span className="text-gray-400">
                            $
                            {formatNumber(
                              positionData?.liquidity?.original_deposited
                                ?.token1_usd,
                              true
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                      <span className="text-xs text-gray-500">
                        Total: $
                        {formatNumber(
                          positionData?.liquidity?.original_deposited
                            ?.total_usd,
                          true
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Current Amounts */}
                  <div className="lg:border-r lg:border-black/10 dark:border-[rgba(255,255,255,0.03)] lg:pr-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                    <div className="text-xs text-gray-500 mb-2">Current</div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {positionData?.pool?.token0?.symbol}:
                        </span>
                        <span className="text-sm dark:text-white font-medium">
                          {formatNumber(
                            positionData?.liquidity?.current_amounts?.token0
                          )}{" "}
                          {positionData?.pool?.token0?.symbol}{" "}
                          <span className="text-gray-400">
                            $
                            {formatNumber(
                              positionData?.liquidity?.current_amounts
                                ?.token0_usd,
                              true
                            )}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {positionData?.pool?.token1?.symbol}:
                        </span>
                        <span className="text-sm dark:text-white font-medium">
                          {formatNumber(
                            positionData?.liquidity?.current_amounts?.token1
                          )}{" "}
                          {positionData?.pool?.token1?.symbol}{" "}
                          <span className="text-gray-400">
                            $
                            {formatNumber(
                              positionData?.liquidity?.current_amounts
                                ?.token1_usd,
                              true
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                      <span className="text-xs text-gray-500">
                        Total: $
                        {formatNumber(
                          positionData?.liquidity?.current_amounts?.total_usd,
                          true
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Withdrawn */}
                  <div className="pt-4 lg:pt-0 border-t lg:border-t-0 border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                    <div className="text-xs text-gray-500 mb-2">
                      Withdrawn
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {positionData?.pool?.token0?.symbol}:
                        </span>
                        <span className="text-sm dark:text-white font-medium">
                          {formatNumber(
                            positionData?.liquidity?.withdrawn?.token0
                          )}{" "}
                          {positionData?.pool?.token0?.symbol}{" "}
                          <span className="text-gray-400">
                            $
                            {formatNumber(
                              positionData?.liquidity?.withdrawn?.token0_usd,
                              true
                            )}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {positionData?.pool?.token1?.symbol}:
                        </span>
                        <span className="text-sm dark:text-white font-medium">
                          {formatNumber(
                            positionData?.liquidity?.withdrawn?.token1
                          )}{" "}
                          {positionData?.pool?.token1?.symbol}{" "}
                          <span className="text-gray-400">
                            $
                            {formatNumber(
                              positionData?.liquidity?.withdrawn?.token1_usd,
                              true
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                      <span className="text-xs text-gray-500">
                        Total: $
                        {formatNumber(
                          positionData?.liquidity?.withdrawn?.total_usd,
                          true
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isPositionLoading && (
              <div className="mt-4 pt-4 border-t border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-gray-400">
                    Loading position data...
                  </span>
                </div>
              </div>
            )}

            {positionError && (
              <div className="mt-4 pt-4 border-t border-black/10 dark:border-[rgba(255,255,255,0.03)]">
                <div className="text-sm text-red-400">
                  Failed to load position data. Please try again later.
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-4">
              {/* <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border h-9 rounded-md px-3 border-black/10 dark:border-[rgba(255,255,255,0.03)] text-white bg-transparent hover:bg-transparent hover:text-[#00ffff] hover:border-[#00FFFF4D] font-barlow uppercase rounded-box transition-all">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-lock h-3.5 w-3.5 mr-1.5"
                  >
                    <rect
                      width="18"
                      height="11"
                      x="3"
                      y="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  EXTEND LOCK
                </button> */}
              {address?.toLowerCase() == details.owner && (
                <Button
                  onClick={handleUnlock}
                  className="h-auto py-2.5 px-[18px] text-sm font-formula font-normal uppercase rounded-full dark:border-white/10 border-black/10 hover:border-primary hover:text-primary hover:bg-primary/5 active:border-primary active:text-primary active:bg-primary/5 bg-transparent whitespace-nowrap"
                  disabled={
                    Number(details.unlockTime) * 1000 > Date.now() ||
                    isLoading
                  }
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <LockOpen className="w-4 h-4" />
                  UNLOCK
                </Button>
              )}
              <Button
                asChild
                variant="outline"
                className="h-auto py-2.5 px-[18px] text-sm font-formula font-normal uppercase rounded-full dark:border-white/10 border-black/10 hover:border-primary hover:text-primary hover:bg-primary/5 active:border-primary active:text-primary active:bg-primary/5 bg-transparent whitespace-nowrap"
              >
                <Link
                  href={`${chainContractConfig?.explorerURL}/tx/${details.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-external-link h-3.5 w-3.5 mr-1.5"
                  >
                    <path d="M15 3h6v6"></path>
                    <path d="M10 14 21 3"></path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  </svg>
                  VIEW ON EXPLORER
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLockCard;
