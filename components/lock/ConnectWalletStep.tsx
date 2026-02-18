import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { ChevronRight, Shield, Wallet } from "lucide-react";
import { useAccount, useConfig } from "wagmi";
import { Address } from "viem";
import { getBalance } from "@wagmi/core";
import { cn } from "@/lib/utils";
import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useLockStore } from "@/store/useLockStore";

interface ConnectWalletProps {
  onStepChange: (step: number) => void;
}

const ConnectWalletStep = ({ onStepChange }: ConnectWalletProps) => {
  const { chainId, address } = useAccount();
  const config = useConfig();
  const { openConnectModal } = useConnectModal();
  const { openAccountModal } = useAccountModal();

  const setWallet = useLockStore((state) => state.setWalet);

  const [balance, setBalance] = React.useState<string>("0");

  const fetchBalance = async () => {
    try {
      const balance = await getBalance(config, {
        address: address as Address,
        chainId: chainId,
        unit: "ether",
      });

      setBalance(parseFloat(balance.formatted).toFixed(4));
    } catch (error) {
      console.error("Error fetching balance: ", error);
    }
  };

  useEffect(() => {
    if (address) {
      fetchBalance();
    }
  }, [address, chainId]);

  const handleContinue = () => {
    if (address) {
      setWallet(address);
     
      onStepChange(2);
    }
  };
  return (
    <div>
      <Card className="card-primary rounded-xl shadow bg-[#1a1a1a] border border-white/10 grow w-full">
        <CardHeader>
          <CardTitle className="font-formula text-[24px] uppercase leading-[32px] tracking-wider text-primary font-normal">
            CONNECT WALLET
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {address ? (
            <>
              <Card className="px-4 py-3 rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center ">
                <div className="flex justify-start items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex justify-center items-center bg-[#00ffff1a]">
                    <Wallet className="w-5 h-5 text-primary dark:text-primary" />
                  </div>

                  <div className="font-lato">
                    <div className="text-[16px] font-medium leading-6">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                    <div className="text-xs text-[#9ca3af] ">
                      {balance} {chainId == 97 || chainId == 56 ? "BNB" : "ETH"}
                    </div>
                  </div>
                </div>

                <div>
                  <Button
                    variant={"ghost"}
                    className="button-secondary text-sm transition-colors hover:!border hover:border-primary"
                    onClick={openAccountModal}
                  >
                    Disconnect
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <>
              <div className="flex flex-col md:flex-row gap-4">
                <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full">
                  <CardHeader className="space-y-3 pb-3">
                    <CardTitle className="font-formula text-[16px] text-primary dark:text-primary  leading-6 tracking-wider flex justify-start  gap-2 font-normal ">
                      <Shield className="w-5 h-5" />
                      <div className="flex items-center">
                        WHY LOCK LIQUIDITY?
                      </div>
                    </CardTitle>
                    <CardDescription className="font-lato text-sm text-gray-400 dark:text-[#d1d5db] font-normal leading-[20px]">
                      Locking your liquidity provider (LP) tokens builds trust
                      with your community by ensuring trading pairs remain
                      available.
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="text-gray-600 dark:text-gray-400 space-y-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "mr-2 mt-1 inline-block h-[7px] w-[7px] rounded-full bg-gray-600 dark:bg-gray-400"
                          )}
                        />
                        <div className="font-lato text-sm">
                          Prevents rug pulls
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "mr-2 mt-1 inline-block h-[7px] w-[7px] rounded-full bg-gray-600 dark:bg-gray-400"
                          )}
                        />
                        <div className="font-lato text-sm">
                          Increases investor confidence
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={cn(
                            "mr-2 mt-1 inline-block h-[7px] w-[7px] rounded-full bg-gray-600 dark:bg-gray-400"
                          )}
                        />
                        <div className="font-lato text-sm">
                          Demonstrates long-term commitment
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-primary rounded-xl shadow bg-transparent border border-white/10 grow w-full flex flex-col justify-between">
                  <CardHeader className="space-y-3 pb-3">
                    <CardTitle className="font-v text-[16px] text-primary dark:text-primary  leading-6 tracking-wider flex justify-start  gap-2 font-formula font-normal">
                      <Wallet className="w-5 h-5" />
                      CONNECT YOUR WALLET
                    </CardTitle>
                    <CardDescription className="font-lato text-sm text-gray-400 dark:text-[#d1d5db] font-normal leading-[20px]">
                      Connect your wallet to access our liquidity locking
                      services.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="button-primary w-full font-formula uppercase text-[16px] text-black font-medium leading-6 tracking-wider"
                      onClick={openConnectModal}
                    >
                      Connect Wallet <ChevronRight className="w-4 h-4" />{" "}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {address ? (
            <Button
              className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6"
              onClick={handleContinue}
            >
              Continue <ChevronRight />
            </Button>
          ) : (
            <div className="w-full text-sm text-[#6b7280] leading-5 text-center">
              By connecting your wallet, you agree to our Terms of Service.
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConnectWalletStep;
