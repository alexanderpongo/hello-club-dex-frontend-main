"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateMiddle } from "@/lib/utils";

const WalletConnection = () => {
  const { select, wallets, publicKey, disconnect, connecting } = useWallet();
  const [open, setOpen] = useState<boolean>(false);

  const handleWalletSelect = async (walletName: any) => {
    if (walletName) {
      try {
        select(walletName);
        setOpen(false);
      } catch (error) {
        console.error("wallet connection err : ", error);
      }
    }
  };

  const handleDisconnect = async () => {
    disconnect();
  };

  return (
    <div className="text-white">
      <Dialog open={open} onOpenChange={setOpen}>
        <div className="flex gap-2 items-center">
          {!publicKey ? (
            <>
              <DialogTrigger asChild>
                <Button className="button-primary  w-[120px] uppercase">
                  {connecting ? "connecting..." : "Connect Wallet"}
                </Button>
              </DialogTrigger>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="button-primary  w-[120px]">
                  <div className="truncate">
                    {truncateMiddle(publicKey.toBase58())}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-none rounded-sm bg-dark ring-1 ring-inset ring-white/10">
                <DropdownMenuItem className="flex justify-center">
                  <Button
                    className="button-primary !bg-red !text-white"
                    onClick={handleDisconnect}
                  >
                    Disconnect
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DialogContent className="border-none rounded-sm bg-dark ring-1 ring-inset ring-white/10 w-[350px]">
            <DialogTitle className="title-regular-semi-bold text-center">
              <p>Connect a wallet on</p>
              <p>Solana to continue</p>
            </DialogTitle>
            <div className="flex flex-col justify-start space-y-3 overflow-y-auto mt-5">
              {wallets.map((wallet) => (
                <Button
                  key={wallet.adapter.name}
                  onClick={() => handleWalletSelect(wallet.adapter.name)}
                  variant={"ghost"}
                  className="font-formula flex justify-start gap-4 text-lg hover:bg-white/30 rounded-none p-5 transition-all duration-300"
                >
                  <div>
                    <Image
                      src={wallet.adapter.icon}
                      alt={wallet.adapter.name}
                      height={30}
                      width={30}
                      className="rounded-sm"
                    />
                  </div>
                  <div>{wallet.adapter.name}</div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </div>
      </Dialog>
    </div>
  );
};

export default WalletConnection;
