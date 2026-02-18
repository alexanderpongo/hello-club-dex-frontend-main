import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import Image from "next/image";
import { Avatar, AvatarImage } from "./ui/avatar";
import BalanceOnChain from "./BalanceOnChain";

const UserBalancesCard = () => {
  return (
    <Card className="card-primary rounded-md relative h-full overflow-hidden">
      <Image
        src="/assets/hello-1.svg"
        alt="hello-1"
        width={100}
        height={100}
        className="absolute w-[180px] h-auto bottom-1 right-1"
      />
      <CardHeader className="title-regular-semi-bold uppercase">
        Your Balance
        <hr className="title-underline" />
      </CardHeader>

      <CardContent>
        <div className="flex gap-3">
          <div className="my-auto">
            <Avatar className="size-8">
              <AvatarImage src="/icons/hello.svg" alt="hello" />
            </Avatar>
          </div>

          <div className="my-auto">
            <h2 className="title-large-semi-bold">100,000</h2>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <BalanceOnChain chain={"Ethereum"} balance="25,000" />
          <BalanceOnChain chain={"BSC"} balance="50,000" />
          <BalanceOnChain chain={"Solana"} balance="25,000" />
        </div>
      </CardContent>
    </Card>
  );
};

export default UserBalancesCard;
