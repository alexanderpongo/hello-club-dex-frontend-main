import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import Image from "next/image";
import { Card } from "../ui/card";
import { Clock4, Copy, ExternalLink, Loader2, LockOpen } from "lucide-react";
import { Address, Chain } from "viem";
import { differenceInDays, format } from "date-fns";
import { truncateMiddle } from "@/lib/utils";
import Link from "next/link";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { useAccount, useConfig } from "wagmi";
import { waitForTransaction, writeContract } from "@wagmi/core";
import { toast } from "react-toastify";
import { Separator } from "../ui/separator";
import CountdownTimer from "../CountDown";

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

type LockDetailsDialogProps = {
  details: LpLockType;
  chain: Chain;
  isRefetch: boolean;
  setIsRefetch: (value: boolean) => void;
  duration: string;
};

function LockDetailsDialog({
  details,
  chain,
  isRefetch,
  setIsRefetch,
  duration,
}: LockDetailsDialogProps) {
  const { chainId, address } = useAccount();
  const config = useConfig();
  const [remainingDays, setRemainingDays] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    }
  };

  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId || chain?.id || 56] || contractConfig[56];

  useEffect(() => {
    const unlockTime = Number(details.unlockTime) * 1000; // convert to ms
    const now = Date.now();

    const remainingDays = differenceInDays(new Date(unlockTime), new Date(now));
    setRemainingDays(remainingDays.toString());
  }, [details]);

  const handleUnlock = async () => {
    setIsLoading(true);

    try {
      const hash = await writeContract(config, {
        address: chainContractConfig.v3LpLockerAddress as Address,
        abi: chainContractConfig.v3LpLockerABI,
        functionName: "unlockPosition",
        args: [details.tokenId],
        chainId: chainId,
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
    <Dialog>
      <DialogTrigger asChild>
        <div className="button-primary inline-flex !cursor-pointer items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border hover:text-accent-foreground h-9 rounded-md px-3 border-white/10 bg-transparent font-formula uppercase rounded-box transition-all text-white hover:border-[#c2fe0c4D] hover:text-primary dark:hover:bg-[#1f1f1f] hover:bg-gray-100">
          <div className="w-fit flex justify-center items-center uppercase">
            Details
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white dark:bg-[#151515] border border-black/10 dark:border-white/10 px-1 sm:p-6 w-full max-w-2xl left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] shadow-2xl rounded-xl">
        <DialogHeader>
          <DialogTitle>
            <div className="font-semibold tracking-tight text-xl font-formula dark:text-white">
              LOCK DETAILS
            </div>
          </DialogTitle>
          {/* <DialogDescription className="text-sm text-gray-400">
            View detailed information about your locked tokens
          </DialogDescription> */}
        </DialogHeader>

        <Separator className="bg-black/30 dark:bg-[#ffffff1a]" />

        <div className="w-full flex flex-col mt-4">
          <div className="flex flex-row gap-2 items-center">
            <div className="rounded-full bg-gray-800/50 p-2">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" fill="#1FC7D4"></circle>
                <path d="M7 14L12 9L17 14H7Z" fill="white"></path>
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex dark:text-white uppercase font-formula text-lg items-center leading-none">
                {(details.pair || details.token0Symbol) ? (
                  <>
                    {details.pair || details.token0Symbol}
                    {details.token1Symbol && ` / ${details.token1Symbol}`}
                  </>
                ) : (
                  "Unknown Pair"
                )}
              </div>
              <div className="flex gap-1.5 text-[#a3a3a3] text-[10px] items-center uppercase tracking-wider font-lato mt-0.5">
                <ChainImage />
                {chain?.name || "BNB Chain"}
              </div>
            </div>
          </div>

          <div className="flex w-full gap-2 py-4">
            {/* <Card className="card-primary p-4 rounded-xl shadow grow w-full">
              <div className="text-sm dark:text-gray-400 mb-1">
                Amount Locked
              </div>
              <div className="text-2xl font-formula dark:text-white">1</div>
       
            </Card> */}
            <Card className="bg-black/5 dark:bg-white/[0.03] p-4 rounded-xl border border-black/5 dark:border-white/10 shadow-none grow w-full transition-all">
              <div className="text-[10px] dark:text-[#a3a3a3] text-gray-500 mb-1 uppercase tracking-wider font-lato">Unlock Date</div>
              <div className="text-xl font-formula dark:text-white uppercase">
                {format(new Date(Number(details.unlockTime) * 1000), "PPP")}
              </div>
              <span className={`text-[10px] mt-1 text-primary flex items-center font-formula`}>
                <Clock4 className="h-3 w-3 mr-1.5" />
                <CountdownTimer endTime={Number(details.unlockTime)} />
              </span>
            </Card>
          </div>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto ">
            <div className="card-primary shadow flex justify-between items-center p-3 rounded-xl">
              <span className="dark:text-gray-400 text-sm">Lock ID</span>
              <div className="flex items-center">
                <span className="font-medium dark:text-white mr-2">
                  {details.tokenId}
                </span>
                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-pointer" />
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/10">
              <span className="dark:text-[#a3a3a3] text-gray-500 text-sm">Created On</span>
              <span className="font-medium dark:text-white">
                {details?.blockTimestamp!
                  ? format(
                    new Date(Number(details.blockTimestamp) * 1000),
                    "PPP"
                  )
                  : "N/A"}
              </span>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/10">
              <span className="dark:text-[#a3a3a3] text-gray-500 text-sm">Lock Duration</span>
              <span className="font-medium dark:text-white">
                {duration} days
              </span>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/10">
              <span className="dark:text-[#a3a3a3] text-gray-500 text-sm">Owner</span>
              <div className="flex items-center">
                <span className="font-medium dark:text-white mr-2">
                  {truncateMiddle(details.owner)}
                </span>
                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-pointer" />
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/10">
              <span className="dark:text-[#a3a3a3] text-gray-500 text-sm">
                Transaction Hash
              </span>
              <div className="flex items-center">
                <span className="font-medium dark:text-white mr-2 text-sm truncate max-w-[150px] md:max-w-[200px]">
                  {truncateMiddle(details.transactionHash)}
                </span>
                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-pointer" />

                <Link
                  href={`${chainContractConfig?.explorerURL}/tx/${details.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="flex w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-pointer ml-1.5 items-center justify-center" />
                </Link>
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/[0.03] flex justify-between items-center p-3 rounded-xl border border-black/5 dark:border-white/10">
              <span className="dark:text-[#a3a3a3] text-gray-500 text-sm">Token Address</span>
              <div className="flex items-center">
                <span className="font-medium dark:text-white mr-2 text-sm truncate max-w-[150px] md:max-w-[200px]">
                  {truncateMiddle(
                    chainContractConfig?.v3PositionManagerAddress || ""
                  )}
                </span>
                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-pointer" />
                <Link
                  href={`${chainContractConfig?.explorerURL}/address/${chainContractConfig.v3PositionManagerAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="flex w-3.5 h-3.5 text-gray-400 hover:text-primary cursor-pointer ml-1.5 items-center justify-center" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* footer buttons */}
        <div className="flex gap-3 mt-6">
          {/* <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border h-10 px-4 py-2 border-white/10 text-white bg-transparent hover:bg-transparent hover:text-[#00ffff] hover:border-[#00FFFF4D] font-barlow uppercase rounded-box transition-all">
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
              className="lucide lucide-lock h-4 w-4 mr-1.5"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            EXTEND LOCK
          </button> */}
          {address?.toLowerCase() == details.owner && (
            <button
              onClick={handleUnlock}
              className="button-primary w-full flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border h-10 px-4 py-2 border-white/10 text-white bg-transparent hover:bg-transparent hover:text-primary hover:border-[#c2fe0c4D] font-formula uppercase rounded-box transition-all"
              disabled={
                Number(details.unlockTime) * 1000 > Date.now() || isLoading
              }
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <LockOpen className="w-4 h-4" />
              UNLOCK
            </button>
          )}

          <Link
            href={`${chainContractConfig?.explorerURL}/tx/${details.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary w-full flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border h-10 px-4 py-2 border-white/10 text-white bg-transparent hover:bg-transparent hover:text-primary hover:border-[#c2fe0c4D] font-formula uppercase rounded-box transition-all"
          >
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
              className="lucide lucide-external-link h-4 w-4 mr-1.5"
            >
              <path d="M15 3h6v6"></path>
              <path d="M10 14 21 3"></path>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            </svg>
            VIEW ON EXPLORER
          </Link>
          {/* <button className="button-primary w-full flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 border h-10 px-4 py-2 border-white/10 text-white bg-transparent hover:bg-transparent hover:text-primary hover:border-[#c2fe0c4D] font-barlow uppercase rounded-box transition-all">
            CLOSE
          </button> */}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LockDetailsDialog;
