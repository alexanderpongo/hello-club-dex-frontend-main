import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check, Loader2, Triangle } from "lucide-react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { useLockStore } from "@/store/useLockStore";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount, useConfig } from "wagmi";
import { Address, erc20Abi } from "viem";
import { readContract, switchChain } from "@wagmi/core";
import axios from "axios";
import { Separator } from "../ui/separator";

interface SelectAssetProps {
  onStepChange: (step: number) => void;
}

const dexes = [
  {
    id: 1,
    name: "Hello-V3",
    value: "Hello-v3",
    displayName: "HELLO-V3-POS",
  },
  // {
  //   id: 2,
  //   name: "PancakeSwap-V3",
  //   value: "pancakeswap-v3",
  //   displayName: "PCS-V3-POS",
  // },
];

function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

type LpLockType = {
  id?: string;
  owner?: string;
  tokenId: string;
  blockNumber?: string;
  blockTimestamp?: string;
  transactionHash?: string;
  unlockTime?: string;
};

type LpTokenType = {
  id?: string;
  owner?: string;
  tokenId: string;
  blockNumber?: string;
  blockTimestamp?: string;
  transactionHash?: string;
  liquidity?: string;
  amount0?: string;
  amount1?: string;
};

const SelectAssetStep = ({ onStepChange }: SelectAssetProps) => {
  const { chainId, address } = useAccount();
  const config = useConfig();
  const {
    wallet,
    activeTab,
    setActiveTab,
    blockchain,
    setBlockchain,
    selectedDex,
    setSelectedDex,
    tokenIdInput,
    setTokenIdInput,
    debounceTokenIdInput,
    setDebounceTokenIdInput,
    ownerOfTokenId,
    setOwnerOfTokenId,
    isLoadingOwner,
    setIsLoadingOwner,
    selectedToken,
    setSelectedToken,
    setLpToken,
  } = useLockStore();

  const [token1Address, setToken1Address] = useState<string>("");
  const [token2Address, setToken2Address] = useState<string>("");
  const [token1Name, setToken1Name] = useState<string>("");
  const [token2Name, setToken2Name] = useState<string>("");
  const [lpLocks, setLpLocks] = useState<string[]>([]);
  const [lpTokens, setLpTokens] = useState<LpTokenType[]>([]);
  const [isLockLoading, setIsLockLoading] = useState<boolean>(false);
  const [isTokenLoading, setIsTokenLoading] = useState<boolean>(false);

  const fetchLpLocks = async () => {
    //console.log("[SelectAssetStep] fetchLpLocks - Starting fetch for address:", address);
    setIsLockLoading(true);
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId ?? "default"];
    const QUERY = `
           query MyQuery {
              lpLocks (skip: ${0}, first: ${1000},where: {owner: "${address}"})  {
                  tokenId
              }
          }
          `;

    try {
      // const response = await axios.post(
      //   chainContractConfig?.lpLockSubgraphUrl as string,
      //   {
      //     query: QUERY,
      //   }
      // );
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId ?? "default"];
      const response = await fetch("api/get-locks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.lpLockSubgraphUrl as string,
        }),
      });

      const data = await response.json();

      if (data) {
        const idsArray =
          (data?.data as LpLockType[])?.map((lock) => lock.tokenId) || [];
       // console.log("[SelectAssetStep] fetchLpLocks - Locked token IDs:", idsArray);
        setLpLocks(idsArray);
      }
    } catch (error) {
      console.error("Error while fetch lp locks", error);
    } finally {
      setIsLockLoading(false);
      //console.log("[SelectAssetStep] fetchLpLocks - Complete");
    }
  };

  useEffect(() => {
    if (chainId) {
      fetchLpLocks();
    }
  }, [chainId]);

  const fetchTokens = async () => {
    setIsTokenLoading(true);
    // const chainContractConfig: ContractConfigItemType =
    //   contractConfig[chainId ?? "default"];
    // const QUERY = `
    //        query MyQuery {
    //           pools (skip: ${0}, first: ${1000},where: {owner: "${address}",liquidity_gt:"0"})  {
    //               id
    //               tokenId
    //               owner
    //               liquidity
    //               amount0
    //               amount1
    //               blockNumber
    //               blockTimestamp
    //               transactionHash
    //           }
    //       }
    //       `;

    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId ?? "default"];
      const response = await fetch("api/get-pools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          url: chainContractConfig?.subgraphUrl as string,
        }),
      });

      const data = await response.json();
      // console.log("lock", data);

      setLpTokens(data?.data);
    } catch (error) {
      console.error("Error while fetch lp tokens", error);
    } finally {
      setIsTokenLoading(false);
    }
  };

  useEffect(() => {
    if (chainId) {
      fetchTokens();
    }
  }, [chainId]);

  const getOwnerOfNftId = async (tokenId?: string) => {
    setIsLoadingOwner(true);
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const owner = await readContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as Address,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "ownerOf",
        chainId: chainId,
        args: [tokenId ?? tokenIdInput],
      });

      // console.log("owner", owner?.toString());
      setOwnerOfTokenId(owner?.toString()!);
    } catch (error) {
      setOwnerOfTokenId("");
      // console.log("Error while fetch owner of token id", error);
    } finally {
      setIsLoadingOwner(false);
    }
  };

  const getPositionsOfNftId = async (tokenId?: string) => {
    type PositionsType = [string, string, string, ...any[]];
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const positions = (await readContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as Address,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "positions",
        chainId: chainId,
        args: [tokenId ?? tokenIdInput],
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
    if (debounceTokenIdInput) {
      getOwnerOfNftId();
      getPositionsOfNftId(debounceTokenIdInput);
    }
  }, [debounceTokenIdInput]);

  const getTokenSymbol = async (address: string) => {
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const symbol = await readContract(config, {
        address: address as Address,
        abi: erc20Abi,
        functionName: "symbol",
        chainId: chainId,
        args: [],
      });

      // console.log("symbol", symbol);
      return symbol;
    } catch (error) {
      console.error("Error while get token name", error);
    }
  };

  const getTokensSymbols = async () => {
    const name1 = await getTokenSymbol(token1Address);
    const name2 = await getTokenSymbol(token2Address);
    setLpToken(name1 + "/" + name2);
  };

  useEffect(() => {
    if (token1Address && token2Address) {
      getTokensSymbols();
    }
  }, [token1Address, token2Address]);

  useEffect(() => {
    if (chainId) {
      switch (chainId) {
        case 97:
          setBlockchain("binance-testnet");
          break;

        case 56:
          setBlockchain("binance");
          break;

        case 1:
          setBlockchain("ethereum");
          break;

        default:
          setBlockchain("binance-testnet");
          break;
      }
    }
  }, [chainId]);

  const handleContinue = () => {
    // console.log("Continue to the next step");
    onStepChange(3);
  };

  const handleInputTokenId = (input: string) => {
    setTokenIdInput(input);
    debouncedTokenIdInput(input);
    setSelectedToken(input);
  };

  const debouncedTokenIdInput = useCallback(
    debounce((input: string) => {
      setDebounceTokenIdInput(input);
    }, 2000),
    []
  );

  const handleSwitchChain = async (chainId: number) => {
    await switchChain(config, { chainId: chainId });
  };

  return (
    <div>
      <Card className="card-primary rounded-xl shadow bg-[#1a1a1a] border border-white/10 grow w-full">
        <CardHeader>
          <CardTitle className="font-formula text-[24px] uppercase leading-[32px] tracking-wider text-primary font-normal">
            SELECT LP TOKEN
          </CardTitle>
          {/* <CardDescription className="font-lato text-sm text-[#9ca3af] font-normal leading-[23px]">
            Choose the blockchain and LP token for your liquidity lock.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          <>
            {/* step 1 */}
            {/* <div className="font-formula flex justify-start items-center gap-2 mb-4 pb-3 border-b border-[#FFFFFF1A]"> */}
            {/* <div className="w-fit px-2 py-[2px] uppercase text-[12px] font-medium leading-4 tracking-wider text-[#00ffff] bg-[#00ffff1a] rounded-full flex justify-center items-center">
                Step 1
              </div> */}
            {/* <div className="font-formula text-[18px] font-medium leading-6 tracking-wider uppercase text-primary">
                Step 1: SELECT BLOCKCHAIN
              </div> */}
            {/* </div> */}

            {/* <Separator/> */}

            {/* tab (mainnet & testnet) */}
            {/* <div className="font-formula text-sm tracking-wider font-medium w-fit h-10 p-1 border dark:border-white/10 rounded-[12px] uppercase flex justify-start items-center"> */}
            {/* <div
                className={`py-[6px] px-3 cursor-pointer rounded-[10px] ${
                  activeTab == "mainnet"
                    ? "text-primary dark:text-primary bg-gray-200 dark:bg-[#1f293799]"
                    : "text-[#8fabb6]"
                }`}
                onClick={() => setActiveTab("mainnet")}
              >
                Mainnets
              </div> */}
            {/* <div
                className={`py-[6px] px-3 cursor-pointer rounded-[10px] ${
                  activeTab == "testnet"
                    ? "text-primary dark:text-primary bg-gray-200 dark:bg-[#1f293799]"
                    : "text-[#8fabb6]"
                }`}
                onClick={() => setActiveTab("testnet")}
              >
                Testnets
              </div> */}
            {/* </div> */}

            {/* search box */}
            {/* <div className="relative">
              <Input
                type="text"
                placeholder="Search for a blockchain"
                className="font-lato text-sm font-normal leading-5 tracking-wider text-[#9ca3af] bg-gray-900/30 border border-white/10 rounded-[12px] w-full h-10 px-4 pl-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent"
              />
              <Search className="absolute top-1/2 -translate-y-1/2 left-3 text-[#9ca3af] w-4 h-4" />
            </div> */}

            {/* chain selection */}
            {/* {activeTab == "mainnet" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
            {/* <Card
                  className={`rounded-xl shadow bg-transparent border cursor-pointer ${
                    chainId == 1
                      ? "border-primary dark:border-primary"
                      : "border-white/10"
                  }  grow w-full p-3 flex justify-start items-center gap-4 relative`}
                  onClick={() => handleSwitchChain(1)}
                >
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-[#1f293780]">
                    <Image
                      src={"/chain-icons/ethereum-eth.svg"}
                      alt="Ethereum"
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  </div>

                  <div className="font-lato">
                    <div className=" text-[16px] font-medium leading-6 tracking-wide">
                      Ethereum
                    </div>
                    <div className=" text-xs text-[#9ca3af] font-normal">
                      ETH
                    </div>
                  </div>

                  {chainId == 1 && (
                    <div className="w-6 h-6 absolute top-1/2 -translate-y-1/2  right-3 bg-[#00ffff1a] flex justify-center items-center rounded-full text-primary dark:text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </Card> */}

            {/* <Card
                  className={`rounded-xl shadow bg-transparent border cursor-pointer ${
                    chainId == 56
                      ? "border-primary dark:border-primary"
                      : "border-white/10"
                  }  grow w-full p-3 flex justify-start items-center gap-4 relative`}
                  onClick={() => handleSwitchChain(56)}
                >
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-[#1f293780]">
                    <Image
                      src={"/chain-icons/bnb.svg"}
                      alt="Binance"
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  </div>

                  <div className="font-lato">
                    <div className=" text-[16px] font-medium leading-6 tracking-wide">
                      Binance Smart Chain
                    </div>
                    <div className=" text-xs text-[#9ca3af] font-normal">
                      BNB
                    </div>
                  </div>

                  {chainId == 56 && (
                    <div className="w-6 h-6 absolute top-1/2 -translate-y-1/2  right-3 bg-[#00ffff1a] flex justify-center items-center rounded-full text-primary dark:text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </Card>
              </div> */}
            {/* )} */}

            {/* {activeTab == "testnet" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className={`rounded-xl shadow bg-transparent border cursor-pointer ${
                    chainId == 97
                      ? "border-primary dark:border-primary"
                      : "border-white/10"
                  }  grow w-full p-3 flex justify-start items-center gap-4 relative`}
                  onClick={() => handleSwitchChain(97)}
                >
                  <div className="w-10 h-10 rounded-full flex justify-center items-center bg-[#1f293780]">
                    <Image
                      src={"/chain-icons/bnb.svg"}
                      alt="Binance Testnet"
                      width={0}
                      height={0}
                      sizes="100vw"
                      className="w-6 h-6 rounded-full object-cover filter grayscale"
                    />
                  </div>

                  <div className="font-lato">
                    <div className=" text-[16px] font-medium leading-6 tracking-wide">
                      Binance Smart Chain Testnet
                    </div>
                    <div className=" text-xs text-[#9ca3af] font-normal">
                      TBNB
                    </div>
                  </div>

                  {chainId == 97 && (
                    <div className="w-6 h-6 absolute top-1/2 -translate-y-1/2  right-3 bg-[#00ffff1a] flex justify-center items-center rounded-full text-primary dark:text-primary">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </Card>
              </div>
            )} */}

            <Separator className="bg-[#ffffff1a]" />

            {/* step 2 */}
            {/* <div className="font-formula flex justify-start items-center gap-2 mb-4 pb-3 border-b border-[#FFFFFF1A]"> */}
            {/* <div className="w-fit px-2 py-[2px] uppercase text-[12px] font-medium leading-4 tracking-wider text-[#00ffff] bg-[#c2fe0c] rounded-full flex justify-center items-center">
                Step 2
              </div> */}
            {/* <div className="font-formula text-[18px] font-medium leading-6 tracking-wider uppercase">
                Step 2: SELECT LP TOKEN
              </div> */}
            {/* </div> */}

            {/* Dex selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="uppercase font-formula text-sm text-[#9ca3af] font-medium">
                  Select DEX
                </Label>
                <Select
                  value={selectedDex}
                  onValueChange={(value) => setSelectedDex(value)}
                >
                  <SelectTrigger className="h-10 bg-black/10 dark:bg-white dark:bg-opacity-[0.08] border border-white/10 rounded-[12px] font-formula uppercase text-sm font-medium space-x-2">
                    <SelectValue placeholder="Select a dex" className="" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-dark border border-white/10 rounded-[12px] p-2 backdrop-blur-sm">
                    <SelectGroup>
                      {dexes.map((des) => (
                        <SelectItem
                          key={des.id}
                          value={des.id.toString()}
                          className="flex flex-row w-full items-center gap-2 hover:cursor-pointer hover:bg-black/10 hover:dark:bg-white/10"
                        >
                          <div className="flex flex-row items-center gap-2">
                            <p className="inline-flex">{des.name}</p>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="uppercase font-barlow text-sm text-[#9ca3af] font-medium">
                  TOKEN ID (OPTIONAL)
                </Label>
                <Input
                  type="text"
                  value={tokenIdInput}
                  onChange={(e) => handleInputTokenId(e.target.value)}
                  placeholder="Enter token ID"
                  className="font-lato text-sm font-normal leading-5 tracking-wider dark:text-[#9ca3af] bg-black/10 dark:bg-white dark:bg-opacity-[0.08] border border-white/10 rounded-[12px] w-full h-10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                {(tokenIdInput || selectedToken) &&
                  wallet != ownerOfTokenId && (
                    <>
                      {isLoadingOwner ? (
                        <Loader2 className="animate-spin w-[18px] h-[18px]" />
                      ) : (
                        <div className="text-[12px] font-normal text-red-500">
                          You’re not the owner of this token
                        </div>
                      )}
                    </>
                  )}
              </div>
            </div>

            {/* token select */}
            <div className="space-y-3">
              <div className="font-barlow uppercase text-sm text-[#9ca3af] font-medium leading-[14px]">
                AVAILABLE TOKENS IN YOUR WALLET
              </div>
              {isLockLoading || isTokenLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  {lpTokens
                    ?.filter((token) => !lpLocks?.includes(token.id!))
                    .map((token, index) => (
                      <Card
                        key={index}
                        className={`rounded-xl shadow bg-transparent border cursor-pointer ${
                          selectedToken == token.tokenId
                            ? "border-primary dark:border-primary"
                            : "border-white/10"
                        }  grow w-full p-3 flex justify-start items-center gap-4 relative`}
                        onClick={() => {
                          setSelectedToken(token.tokenId);
                          setTokenIdInput(token.tokenId);
                          setDebounceTokenIdInput(token.tokenId);
                          getOwnerOfNftId(token.tokenId);
                          getPositionsOfNftId(token.tokenId);
                        }}
                      >
                        <div className="w-10 h-10 rounded-full flex justify-center items-center bg-[#1f293780]">
                          {/* <Image
                    src={"/chain-icons/ethereum-eth.svg"}
                    alt="Ethereum"
                    width={0}
                    height={0}
                    sizes="100vw"
                    className="w-6 h-6 rounded-full object-cover"
                  /> */}
                          <div className="w-5 h-5 flex justify-center items-center bg-[#1FC7D4] rounded-full">
                            <Triangle className="w-[16px] h-[10px] text-white fill-white" />
                          </div>
                        </div>

                        <div className="font-lato">
                          <div className=" text-[16px] font-medium leading-6 tracking-wide">
                            {dexes
                              .filter(
                                (dex) => dex.id.toString() === selectedDex
                              )
                              .map((dex) => (
                                <>{dex.displayName}</>
                              ))}
                          </div>
                          <div className=" text-xs text-[#9ca3af] font-normal">
                            {/* V3 Position №: {token.tokenId ?? "N/A"} */}
                            V3 Position No: {token.tokenId ?? "N/A"}
                          </div>
                        </div>

                        {selectedToken == token.tokenId && (
                          <div className="w-6 h-6 absolute top-1/2 -translate-y-1/2  right-3 bg-[#00ffff1a] flex justify-center items-center rounded-full text-primary dark:text-primary">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </Card>
                    ))}

                  {lpTokens?.filter((token) => !lpLocks?.includes(token.id!))
                    .length <= 0 && (
                    <div className="text-xs">No tokens available</div>
                  )}
                </>
              )}
            </div>
          </>
        </CardContent>
        <CardFooter className="flex justify-start items-center gap-4">
          <Button
            variant={"outline"}
            className="button-secondary w-full !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-barlow uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary"
            onClick={() => onStepChange(1)}
          >
            Back
          </Button>
          <Button
            className="button-primary w-full font-barlow text-sm uppercase text-black font-medium leading-6"
            onClick={handleContinue}
            disabled={
              !(selectedToken || tokenIdInput) ||
              !blockchain ||
              isLoadingOwner ||
              (tokenIdInput ? wallet !== ownerOfTokenId : false) ||
              tokenIdInput !== debounceTokenIdInput
            }
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
export default SelectAssetStep;
