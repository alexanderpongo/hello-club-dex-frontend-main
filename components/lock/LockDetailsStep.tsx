import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, getRelativeTimeFromNow } from "@/lib/utils";
import { useLockStore } from "@/store/useLockStore";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { contractConfig } from "@/config/blockchain.config";
import { readContract } from "@wagmi/core";
import { Address, formatUnits } from "viem";
import { useAccount, useConfig } from "wagmi";

interface LockDetailsProps {
  onStepChange: (step: number) => void;
}

const LockDetailsStep = ({ onStepChange }: LockDetailsProps) => {
  const { chainId } = useAccount();
  const config = useConfig();
  const {
    lockAmount,
    setLockAmount,
    date,
    setDate,
    serviceFee,
    setServiceFee,
    isLoadingServiceFee,
    setIsLoadingServiceFee,
  } = useLockStore();
  // const [balance, setBalance] = React.useState<string>("1");
  // const [unlockDate, setUnlockDate] = React.useState<string>("");
  const [isvalidReferal, setIsValidReferral] = React.useState<boolean>(false);
  const [referralCode, setReferralCode] = React.useState<string>("");

  const getServiceFee = async () => {
    setIsLoadingServiceFee(true);
    try {
      const chainContractConfig: ContractConfigItemType =
        contractConfig[chainId || "default"];

      const serviceFee = await readContract(config, {
        address: chainContractConfig.v3LpLockerAddress as Address,
        abi: chainContractConfig.v3LpLockerABI,
        functionName: "lockFee",
        chainId: chainId,
        args: [],
      });

      // console.log("owner", serviceFee);
      setServiceFee(formatUnits(serviceFee as bigint, 18));
    } catch (error) {
      setServiceFee("");
      console.error("Error while fetch service fee", error);
    } finally {
      setIsLoadingServiceFee(false);
    }
  };

  useEffect(() => {
    if (chainId) {
      getServiceFee();
    }
  }, [chainId]);

  const handleContinue = () => {
    // console.log("Continue to the next step");
    onStepChange(4);
  };

  return (
    <div>
      <Card className="card-primary rounded-xl shadow bg-[#1a1a1a] border border-white/10 grow w-full">
        <CardHeader>
          <CardTitle className="font-formula text-[24px] font-semibold leading-[32px] tracking-wider">
            LOCK DETAILS
          </CardTitle>
          {/* <CardDescription className="font-lato text-sm text-[#9ca3af] font-normal leading-[23px]">
            Set the amount and time period for your liquidity NFT lock.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* <div className="space-y-1">
            <Label className="font-lato text-sm text-[#d1d5db] font-medium leading-[14px]">
              Lock amount
            </Label>
            <Input
              type="text"
              value={lockAmount!}
              onChange={(e) => setLockAmount(e.target.value)}
              placeholder="Enter token ID"
              className="font-lato text-sm font-normal leading-5 tracking-wider text-[#9ca3af] bg-gray-900/30 border border-white/10 rounded-[12px] w-full h-10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent"
            />
            <div className="font-lato text-sm text-[#9ca3af] font-normal leading-5">
              Your balance: {balance}
            </div>
          </div> */}

          {/* unlock date */}
          <div className="w-full space-y-1">
            <Label className="uppercase font-formula text-sm text-[#9ca3af] font-medium">
              UNLOCK DATE
              {/* <CircleAlert className=" text-gray-500 h-4 w-4 rotate-180" /> */}
            </Label>
            <Popover>
              <PopoverTrigger className="w-full" asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full h-auto min-h-10 py-2 justify-start text-left font-normal rounded-[12px] bg-black/10 dark:bg-white dark:bg-opacity-[0.08] border border-white/10",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon />
                  {date ? (
                    <div className="flex flex-col">
                      <span>{format(date, "PPP")}</span>
                      <span className="text-xs text-primary">
                        ({getRelativeTimeFromNow(date)} from now)
                      </span>
                    </div>
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-fit p-0 bg-white dark:bg-dark border border-white/10"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={date!}
                  onSelect={setDate}
                  initialFocus
                  required
                  disabled={(date) =>
                    date <= new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="p-3"
                  classNames={{
                    months:
                      "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 relative",
                    month: "space-y-4 !ml-0 ",
                    caption: "flex justify-center pt-1 items-center ",
                    caption_label: "text-sm font-medium",
                    nav: "space-x-1 flex items-between h-fit absolute top-0 w-full",
                    nav_button:
                      "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-white/10 rounded-md",
                    nav_button_previous: "absolute !left-1",
                    nav_button_next: "absolute !right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex ",
                    head_cell: " rounded-md w-9 font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-md hover:bg-accent hover:text-accent-foreground",
                    day_selected:
                      "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    day_today: "bg-accent text-accent-foreground",
                    day_outside: "",
                    day_disabled: "",
                    day_range_middle:
                      "aria-selected:bg-accent aria-selected:text-accent-foreground",
                    day_hidden: "invisible",
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* service fee */}
          <Card className=" rounded-xl shadow bg-transparent border border-white/10 grow w-full flex justify-between items-center p-3">
            <div className="font-lato text-[16px] font-medium leading-6">
              Service Fee
            </div>
            <div className="font-lato text-[16px] text-primary dark:text-primary font-medium leading-6">
              {isLoadingServiceFee ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div>${serviceFee}</div>
              )}
            </div>
          </Card>

          {/* checkbox */}
          {/* <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="referal"
                value={isvalidReferal ? "checked" : ""}
                className="rounded-[4px] border-gray-600 data-[state=checked]:text-[#000000]"
                onCheckedChange={(checked) => {
                  setIsValidReferral(checked === true);
                }}
              />
              <Label htmlFor="referal" className="space-y-2 cursor-pointer">
                <div className="text-sm text-[#d1d5db] font-medium leading-[14px] peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Do you have a valid Referral Address
                </div>
                <div className="text-sm text-[#6b7280] font-normal leading-5">
                  Receive a 10% discount!
                </div>
              </Label>
            </div>
            {isvalidReferal && (
              <div className="space-y-1">
                <Input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral address"
                  className="font-lato text-sm font-normal leading-5 tracking-wider text-[#9ca3af] bg-gray-900/30 border border-white/10 rounded-[12px] w-full h-10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#00ffff] focus:border-transparent"
                />
              </div>
            )}
          </div> */}
        </CardContent>
        <CardFooter className="flex justify-start items-center gap-4">
          <Button
            variant={"outline"}
            className="button-secondary w-full !bg-transparent border border-[#c2fe0c4D] dark:border-white/10 rounded-[12px] font-formula uppercase text-sm font-medium space-x-2 hover:border-primary dark:hover:border-primary"
            onClick={() => onStepChange(2)}
          >
            Back
          </Button>
          <Button
            className="button-primary w-full font-formula text-sm uppercase text-black font-medium leading-6"
            onClick={handleContinue}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LockDetailsStep;
