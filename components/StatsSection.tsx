"use client";
import StatCard from "@/components/StatCard";
import React from "react";
import { useAppStore } from "@/store";
import { abbreviateNumber } from "@/lib/utils";
// import { useSession } from 'next-auth/react';

const StatsSection = () => {
  const {
    stakedAmount,
    pendingRewardAmount,
    isStakeInfoLoading,
    totalLockedHelloAmount,
    isTotalLockedHelloAmountLoading,
    helloPriceInUsd,
    isHelloPriceInUsdLoading,
    isTotalUniqueHoldersLoading,
    totalUniqueHolders,
  } = useAppStore();
  // const { data: session } = useSession();

  const platformStats: StatCardProps[] = [
    {
      label: "Total locked\ntokens:",
      value: abbreviateNumber(totalLockedHelloAmount),
      avatarImage: "/icons/hello.svg",
      isLoading: isTotalLockedHelloAmountLoading,
    },
    {
      label: "Total\nholders:",
      value: abbreviateNumber(totalUniqueHolders),
      isLoading: isTotalUniqueHoldersLoading,
    },
    {
      label: "Total value\nlocked:",
      value: abbreviateNumber(totalLockedHelloAmount * helloPriceInUsd),
      avatarImage: "/icons/usd.webp",
      isLoading: isTotalLockedHelloAmountLoading || isHelloPriceInUsdLoading,
    },
  ];

  const userStats: StatCardProps[] = [
    {
      label: "Locked Tokens\nAmount:",
      value: abbreviateNumber(stakedAmount),
      avatarImage: "/icons/hello.svg",
      isLoading: isStakeInfoLoading,
    },
    {
      label: "Value\nLocked:",
      value: abbreviateNumber(stakedAmount * helloPriceInUsd),
      avatarImage: "/icons/usd.webp",
      isLoading: isStakeInfoLoading || isHelloPriceInUsdLoading,
    },
    {
      label: "Earned\nRewards:",
      value: abbreviateNumber(pendingRewardAmount),
      avatarImage: "/icons/hello.svg",
      isLoading: isStakeInfoLoading,
    },
  ];

  return (
    <div>
      <div>
        <h1 className="title-xl-bold uppercase">Platform Stats</h1>
        <hr className="title-underline" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-3 mt-5">
          {platformStats.map((stat, index) => (
            <div key={index} className="col-span-1">
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>

      {/* {session && (
        <div className="mt-10">
          <h1 className="title-xl-bold uppercase">Your Stats</h1>
          <hr className="title-underline" />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-3 mt-5">
            {userStats.map((stat, index) => (
              <div key={index} className="col-span-1">
                <StatCard {...stat} />
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default StatsSection;
