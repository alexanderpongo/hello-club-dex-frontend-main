import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useLockStore } from "@/store/useLockStore";
import { format, getTime } from "date-fns";
import { Loader2 } from "lucide-react";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { readContract, waitForTransaction, writeContract } from "@wagmi/core";
import { Address, erc20Abi, formatUnits, parseUnits } from "viem";
import { useAccount, useConfig } from "wagmi";
import { toast } from "react-toastify";
import Link from "next/link";

interface LockDetailsReviewProps {
  onStepChange: (step: number) => void;
}

const LockDetailsReviewStep = ({ onStepChange }: LockDetailsReviewProps) => {
  const { address, chainId } = useAccount();
  const config = useConfig();
  const {
    wallet,
    blockchain,
    lpToken,
    // lockAmount,
    date,
    serviceFee,
    tokenIdInput,
    setTxHash,
    // setLockId,
  } = useLockStore();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingApproved, setIsLoadingApproved] = useState<boolean>(false);
  const [approvedAddress, setApprovedAddress] = useState<string>("");

  const [feeAllowance, setFeeAllowance] = useState<string>("");

  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId || "default"];

  const getApprovedToAddress = async () => {
    setIsLoadingApproved(true);
    try {
      const approvedToAddress = await readContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as Address,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "getApproved",
        chainId: chainId,
        args: [tokenIdInput],
      });
      // console.log("approved adress", approvedToAddress);
      setApprovedAddress(approvedToAddress as string);
    } catch (error) {
      console.error("Error while fetch get approved to address", error);
    } finally {
      setIsLoadingApproved(false);
    }
  };

  useEffect(() => {
    if (tokenIdInput) {
      getApprovedToAddress();
    }
  }, [tokenIdInput, chainId]);

  const getAllowance = async () => {
    setIsLoadingApproved(true);
    try {
      const allowance = await readContract(config, {
        address: chainContractConfig.v3LpLockerFeeTokenAddress as Address,
        abi: erc20Abi,
        functionName: "allowance",
        chainId: chainId,
        args: [
          wallet as Address,
          chainContractConfig.v3LpLockerAddress as Address,
        ],
      });
      // console.log("approved adress", allowance);
      setFeeAllowance(formatUnits(allowance, 18));
    } catch (error) {
      console.error("Error while fetch fee allowance", error);
    } finally {
      setIsLoadingApproved(false);
    }
  };

  useEffect(() => {
    if (wallet) {
      getAllowance();
    }
  }, [wallet]);

  const getFeeTokenBalance = async () => {
    try {
      const balance = await readContract(config, {
        address: chainContractConfig.v3LpLockerFeeTokenAddress as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        chainId: chainId,
        args: [address as Address],
      });

      return balance;
    } catch (error) {
      console.error("Error while fetch fee token balance", error);
    }
  };

  const handleApprove = async () => {
    setIsLoadingApproved(true);
    try {
      const hash = await writeContract(config, {
        address: chainContractConfig.v3PositionManagerAddress as Address,
        abi: chainContractConfig.v3PositionManagerABI,
        functionName: "approve",
        args: [chainContractConfig?.v3LpLockerAddress as Address, tokenIdInput],
        chainId: chainId,
      });

      const data = await waitForTransaction(config, {
        hash: hash,
      });

      if (data?.status == "success") {
        toast.success(
          <div>
            <p>Successfully approved</p>
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
            toastId: "approve-lock-token",
          }
        );
      }
    } catch (error: any) {
      console.error("Error while approve", error);
      toast.error(error?.shortMessage || "Transaction failed", {
        toastId: "token-approve-error-toast",
      });
    } finally {
      getApprovedToAddress();
      setIsLoadingApproved(false);
    }
  };

  const handleApproveFee = async () => {
    setIsLoadingApproved(true);
    const feeTokenBalance = await getFeeTokenBalance();

    if (
      parseFloat(formatUnits(feeTokenBalance!, 18)) < parseFloat(serviceFee!)
    ) {
      toast.error("Insufficient token balance", {
        toastId: "fee-token-balance-error-toast",
      });
      // console.log("balance fee token : ", formatUnits(feeTokenBalance!, 18));
      // console.log("service fee : ", serviceFee);
      setIsLoadingApproved(false);
      return;
    }

    try {
      const hash = await writeContract(config, {
        address: chainContractConfig.v3LpLockerFeeTokenAddress as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [
          chainContractConfig?.v3LpLockerAddress as Address,
          parseUnits(serviceFee!, 18),
        ],
        chainId: chainId,
      });

      const data = await waitForTransaction(config, {
        hash: hash,
      });

      if (data?.status == "success") {
        toast.success(
          <div>
            <p>Successfully approved</p>
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
            toastId: "approve-lock-token",
          }
        );
      }
    } catch (error: any) {
      console.error("Error while approve", error);
      toast.error(error?.shortMessage || "Transaction failed", {
        toastId: "fee-approve-error-toast",
      });
    } finally {
      getAllowance();
      setIsLoadingApproved(false);
    }
  };

  const handleCreateContract = async () => {
    setIsLoading(true);
    try {
      const dateTime = new Date(date!);
      const timestampInSeconds = Math.floor(getTime(dateTime) / 1000);

      const hash = await writeContract(config, {
        address: chainContractConfig.v3LpLockerAddress as Address,
        abi: chainContractConfig.v3LpLockerABI,
        functionName: "lockPosition",
        args: [tokenIdInput, timestampInSeconds],
        chainId: chainId,
      });

      const data = await waitForTransaction(config, {
        hash: hash,
      });

      // console.log("lock data", data);

      if (data?.status == "success") {
        setTxHash(data?.transactionHash);
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
            toastId: "lock-lp",
          }
        );
        onStepChange(5);
      }
    } catch (error: any) {
      console.error("Error while lock LP", error);
      toast.error(error?.shortMessage || "Transaction failed", {
        toastId: "lp-lock-error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="card-primary rounded-xl shadow bg-[#1a1a1a] border border-white/10 grow w-full">
        <CardHeader>
          <CardTitle className="font-formula text-[24px] font-semibold leading-[32px] tracking-wider">
            REVIEW & CREATE
          </CardTitle>
          {/* <CardDescription className="font-lato text-sm text-[#9ca3af] font-normal leading-[23px]">
            Review your details and create the liquidity lock contract.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            {/* wallet */}
            <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-[16px] text-gray-500 dark:text-[#9ca3af] font-normal leading-6">
                Wallet
              </div>
              <div className="font-lato text-[16px] font-medium leading-6">
                {/* {wallet ?? "N/A"} */}
                {wallet && wallet?.slice(0, 6)}...{wallet?.slice(-4)}
                {!wallet && "N/A"}
              </div>
            </Card>

            {/* blockchain */}
            <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-[16px] text-gray-500 dark:text-[#9ca3af] font-normal leading-6">
                Blockchain
              </div>
              <div className="font-lato text-[16px] font-medium leading-6 capitalize">
                {blockchain ?? "N/A"}
              </div>
            </Card>

            {/* lp token */}
            <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-[16px] text-gray-500 dark:text-[#9ca3af] font-normal leading-6">
                LP Token
              </div>
              <div className="font-lato text-[16px] font-medium leading-6">
                {lpToken ?? "N/A"}
              </div>
            </Card>

            {/* lock amount */}
            {/* <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-[16px] text-gray-500 dark:text-[#9ca3af] font-normal leading-6">
                Lock Amount
              </div>
              <div className="font-lato text-[16px] font-medium leading-6">
                {lockAmount ?? "N/A"}
              </div>
            </Card> */}

            {/* unlock date */}
            <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-[16px] text-gray-500 dark:text-[#9ca3af] font-normal leading-6">
                Unlock Date
              </div>
              <div className="font-lato text-[16px] font-medium leading-6">
                {date ? format(date, "PPP") : "N/A"}
              </div>
            </Card>

            {/* service fee */}
            <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
              <div className="font-lato text-[16px] text-gray-500 dark:text-[#9ca3af] font-normal leading-6">
                Service Fee
              </div>
              <div className="font-lato text-[16px] text-primary dark:text-primary font-medium leading-6">
                ${serviceFee ?? "N/A"}
              </div>
            </Card>
          </div>
        </CardContent>
        <CardFooter className="flex justify-start items-center gap-4">
          <Button
            variant={"outline"}
            className="button-secondary w-full !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-formula uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary"
            onClick={() => onStepChange(3)}
          >
            Back
          </Button>
          {approvedAddress != chainContractConfig.v3LpLockerAddress ? (
            <Button
              className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6 flex justify-center items-center gap-2"
              onClick={handleApprove}
              disabled={isLoadingApproved}
            >
              {isLoadingApproved && <Loader2 className="animate-spin" />}
              Approve Token
            </Button>
          ) : (
            <>
              {parseFloat(feeAllowance) < parseFloat(serviceFee!) ? (
                <Button
                  className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6 flex justify-center items-center gap-2"
                  onClick={handleApproveFee}
                  disabled={isLoadingApproved || isLoading}
                >
                  {(isLoadingApproved || isLoading) && (
                    <Loader2 className="animate-spin" />
                  )}
                  Approve Fee
                </Button>
              ) : (
                <Button
                  className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6 flex justify-center items-center gap-2"
                  onClick={handleCreateContract}
                  disabled={isLoadingApproved || isLoading}
                >
                  {(isLoadingApproved || isLoading) && (
                    <Loader2 className="animate-spin" />
                  )}
                  LOCK LP
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default LockDetailsReviewStep;

/* service fee */
//  <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
//  <div className="font-lato text-[16px] font-medium leading-6">
//    Service Fee
//  </div>
//  <div className="font-lato text-[16px] text-[#00ffff] font-medium leading-6">
//    $150.00
//  </div>
// </Card>
