import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CircleCheckBig, Clock4, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useLockStore } from "@/store/useLockStore";
import Image from "next/image";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { truncateMiddle } from "@/lib/utils";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount } from "wagmi";

interface ResponseProps {
  onStepChange: (step: number) => void;
}

const ResponseStep = ({ onStepChange }: ResponseProps) => {
  const { push } = useRouter();
  const { chainId } = useAccount();
  const {
    tokenIdInput,
    blockchain,
    lpToken,
    // lockAmount,
    date,
    txHash,
    // lockId,
  } = useLockStore();

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId || "default"];

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

  return (
    <div>
      <Card className="card-primary rounded-xl shadow bg-[#1a1a1a] border border-white/10 grow w-full p-6 space-y-6">
        <div className="flex flex-col justify-center items-center">
          <div className="w-20 h-20 bg-[#00ffff1a] rounded-full flex justify-center items-center">
            <CircleCheckBig className="w-12 h-12 text-primary dark:text-primary" />
          </div>
          <div className="font-formula text-[24px] font-semibold leading-[32px] tracking-wider mt-4 mb-3">
            LOCK CREATED SUCCESSFULLY
          </div>
          {/* <div className="font-lato text-sm text-[#9ca3af] font-normal leading-[23px]">
            Your liquidity has been locked successfully. You can view the
            details in your dashboard.
          </div> */}
        </div>

        <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full p-4">
          <CardHeader className="p-0">
            <CardTitle className="font-formula text-sm text-primary dark:text-primary font-semibold leading-5 tracking-wide">
              LOCK DETAILS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 mt-4 px-0">
            <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-sm text-gray-500 dark:text-[#9ca3af] !font-normal">
                Transaction Hash
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                <div>{truncateMiddle(txHash)}</div>
                {/* {isCopied ? (
                  <CopyCheck
                    className="w-4 h-4 cursor-pointer text-[#9ca3af] hover:text-[#00ffff]"
                    onClick={() =>
                      handleCopy("0x7d2b9c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b")
                    }
                  />
                ) : ( */}
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
                Lock ID
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                <div>{tokenIdInput ?? "N/A"}</div>
                {/* {isCopied ? (
                  <CopyCheck
                    className="w-4 h-4 cursor-pointer text-[#9ca3af] hover:text-[#00ffff]"
                    onClick={() => handleCopy("12345")}
                  />
                ) : ( */}
                <Copy
                  className="w-4 h-4 cursor-pointer text-[#9ca3af] hover:text-primary"
                  onClick={() => handleCopy(tokenIdInput)}
                />
                {/* )} */}
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
                LP Token
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                {lpToken ?? "N/A"}
              </div>
            </Card>

            {/* <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-sm text-[#9ca3af] !font-normal">
                Amount Locked
              </div>
              <div className="font-lato text-sm font-medium leading-5 flex justify-center items-center gap-2">
                {lockAmount ?? "N/A"}
              </div>
            </Card> */}

            <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-sm text-gray-500 dark:text-[#9ca3af] !font-normal">
                Unlock Date
              </div>
              <div className="font-lato text-sm text-white !font-normal leading-5 flex justify-center items-center gap-2 bg-[#252525] py-[6px] px-3 rounded-full border border-[#ffffff1a]">
                <Clock4 className="w-[14px] h-[14px] text-primary" />
                <div>{date ? format(date, "PPP") : "N/A"}</div>
                {/* <div className="text-[#00ffff]">(395 days)</div> */}
              </div>
            </Card>
          </CardContent>
        </Card>

        <CardFooter className="p-0 flex flex-col gap-3">
          <Button
            className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6"
            onClick={() => push("/dashboard")}
          >
            VIEW IN DASHBOARD
          </Button>
          <Button
            variant={"outline"}
            className="button-secondary w-full !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-formula uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary"
            onClick={() => onStepChange(1)}
          >
            Create another lock
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResponseStep;
