"use client";
import React, { useEffect, useState } from "react";
import { CircleCheckBig, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { truncateMiddle } from "@/lib/utils";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLockStore } from "@/store/useLockStore";
import Image from "next/image";
import { useLiquidityPoolStore } from "@/store/liquidity-pool.store";

const LPSuccessResponse = () => {
  const { push } = useRouter();
  const { chainId } = useAccount();
  const { blockchain, setBlockchain } = useLockStore();
  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId || "default"];
  const {
    setActiveStep,
    setLpAddingSuccess,
    setCurrencyA,
    setCurrencyB,
    setCurrencyATokenBalance,
    setCurrencyBTokenBalance,
    setCurrencyATokenInputAmount,
    setCurrencyBTokenInputAmount,
    setFeeTier,
    setTickSpace,
    setActivePriceRange,
    setTickLowerPrice,
    setTickUpperPrice,
    txHash,
    currencyA,
    currencyB,
  } = useLiquidityPoolStore();
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (chainId) {
      switch (chainId) {
        case 8453:
          setBlockchain("base");
          break;

        case 56:
          setBlockchain("binance");
          break;

        case 1:
          setBlockchain("ethereum");
          break;

        default:
          setBlockchain("binance");
          break;
      }
    }
  }, [chainId]);

  const ChainImage = () => {
    switch (blockchain) {
      case "binance":
        return (
          <Image
            src={"/chain-icons/bnb.svg"}
            alt={blockchain}
            height={0}
            width={0}
            sizes="100vw"
            className="w-4 h-4"
          />
        );
        break;

      case "binance-testnet":
        return (
          <Image
            src={"/chain-icons/bnb.svg"}
            alt={blockchain}
            height={0}
            width={0}
            sizes="100vw"
            className="w-4 h-4 filter grayscale"
          />
        );
        break;

      case "ethereum":
        return (
          <Image
            src={"/chain-icons/ethereum-eth.svg"}
            alt={blockchain}
            height={0}
            width={0}
            sizes="100vw"
            className="w-4 h-4"
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
            className="w-4 h-4"
          />
        );
        break;
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 5000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const addNewLpHandler = () => {
    setActiveStep(1);
    setLpAddingSuccess(false);
    setCurrencyA(null);
    setCurrencyB(null);
    setCurrencyATokenInputAmount("");
    setCurrencyBTokenInputAmount("");
    setFeeTier("0.03");
    setTickSpace(60);
    setActivePriceRange(0);
    setTickLowerPrice("0");
    setTickUpperPrice("0");
    setCurrencyATokenBalance("0");
    setCurrencyBTokenBalance("0");
  };

  return (
    <div className="flex flex-row w-full">
      <Card className="card-primary rounded-xl shadow bg-[#1a1a1a] border border-white/10 grow w-full p-6 space-y-6">
        <div className="flex flex-col justify-center items-center">
          <div className="w-20 h-20 bg-[#00ffff1a] rounded-full flex justify-center items-center">
            <CircleCheckBig className="w-12 h-12 text-primary dark:text-primary" />
          </div>
          <div className="flex justify-center items-center mx-auto text-center font-formula md:text-[24px] font-semibold leading-[32px] tracking-wider mt-4 mb-3">
            LIQUIDITY ADDED SUCCESSFULLY
          </div>
        </div>

        <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full p-4">
          <CardHeader className="p-0">
            <CardTitle className="font-formula text-sm text-primary dark:text-primary font-semibold leading-5 tracking-wide">
              LIQUIDITY ADD DETAILS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 mt-4 px-0">
            <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-sm text-gray-500 dark:text-[#9ca3af] !font-normal">
                Transaction Hash
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                <div>{truncateMiddle(txHash)}</div>

                <Copy
                  className="w-4 h-4 cursor-pointer text-[#9ca3af] hover:text-primary"
                  onClick={() => handleCopy(txHash)}
                />
                {/* )} */}
                <Link
                  href={`${chainContractConfig?.explorerURL}/tx/${txHash}`}
                  target="_blank"
                >
                  <ExternalLink className="w-4 h-4 cursor-pointer text-[#9ca3af] hover:text-primary" />
                </Link>
              </div>
            </Card>

            <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-sm text-gray-500 dark:text-[#9ca3af] !font-normal">
                Blockchain
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                <ChainImage />
                <div className="capitalize">{blockchain}</div>
              </div>
            </Card>

            <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-sm text-gray-500 dark:text-[#9ca3af] !font-normal">
                LP Tokens
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                {currencyA?.symbol}/{currencyB?.symbol}
              </div>
            </Card>
          </CardContent>
        </Card>

        <CardFooter className="p-0 flex flex-col gap-3">
          <Button
            className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6"
            onClick={() => {
              push("/pools");
            }}
          >
            VIEW IN POOLS
          </Button>
          <Button
            variant={"outline"}
            className="button-secondary w-full !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-formula uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary"
            onClick={addNewLpHandler}
          >
            Create another Liquidity Pool
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LPSuccessResponse;
