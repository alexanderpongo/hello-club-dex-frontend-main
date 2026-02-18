// "use client";
// import React, { useEffect } from "react";
// import { useGetHelloTokenMetadata } from "@/hooks/useGetHelloTokenMetadata";
// import { useGetTotalLockedHelloAmount } from "@/hooks/useGetTotalLockedHelloAmount";
// import { useGetStakeInfo } from "@/hooks/useGetStakeInfo";
// import { useGetHelloTokenBalance } from "@/hooks/useGetHelloTokenBalance";
// import { useGetUnlockPenalty } from "@/hooks/useGetUnlockPenalty";
// import { useGetTierApr } from "@/hooks/useGetTierApr";
// import { useGetHelloPriceInUsd } from "@/hooks/useGetHelloPriceInUsd";
// import { useGetTotalUniqueHolders } from "@/hooks/useGetTotalUniqueHolders";
// // import { useGetStakeFee } from "@/hooks/useGetStakeFee";
// import { useAccount } from "wagmi";
// import { useAppStore } from "@/store";
// import { useIsAdmin } from "@/hooks/useIsAdmin";
// import { useGetTierTotalStakedAmount } from "@/hooks/useGetTierTotalStakedAmount";
// import Cookies from "js-cookie";
// import { useGetUserProfileDetails } from "@/hooks/useGetUserProfileDetails";
// import { useSession } from "next-auth/react";
// import { useGetWhaleProfileDetails } from "@/hooks/useGetWhaleProfileDetails";

// const InitProvider = ({ children }: { children: React.ReactNode }) => {
//   const { helloTokenAddress, helloTokenDecimals } = useAppStore();
//   const { address, isConnected } = useAccount();
//   const { data: session } = useSession();

//   const { fetchUserProfileDetails } = useGetUserProfileDetails(); // fetch user profile details
//   const { fetchUserWhaleDetails } = useGetWhaleProfileDetails();
//   const { fetchHelloTokenMetadata } = useGetHelloTokenMetadata(); // fetch hello token metadata
//   const { fetchTotalLockedHelloAmount } = useGetTotalLockedHelloAmount(); // fetch total locked hello amount
//   const { fetchStakeInfo } = useGetStakeInfo(); // fetch user stake info
//   const { fetchHelloBalance } = useGetHelloTokenBalance(); // fetch user hello balance
//   const { fetchUnlockPenalty } = useGetUnlockPenalty(); // fetch unlock penalty
//   const { fetchTierApr } = useGetTierApr(); // fetch apr for each tier
//   const { getHelloPriceInUsd } = useGetHelloPriceInUsd(); // fetch hello price in usd
//   const { fetchTotalUniqueHolders } = useGetTotalUniqueHolders(); // fetch total unique holders
//   const { fetchStakeFee } = useGetStakeFee(); // fetch stake fee
//   const { fetchIsAdmin } = useIsAdmin(); // fetch is admin
//   const { fetchTierTotalStakedAmount } = useGetTierTotalStakedAmount(); // fetch total staked amount for each tier

//   useEffect(() => {
//     if (session) {
//       fetchUserProfileDetails();
//       fetchUserWhaleDetails();
//     }
//   }, [session]);

//   useEffect(() => {
//     fetchHelloTokenMetadata();
//     fetchUnlockPenalty();
//     fetchTierApr();
//     getHelloPriceInUsd();
//     fetchTotalUniqueHolders();
//     fetchStakeFee();
//   }, []);

//   useEffect(() => {
//     fetchTotalLockedHelloAmount();
//     fetchTierTotalStakedAmount();
//   }, [helloTokenAddress, helloTokenDecimals]);

//   useEffect(() => {
//     fetchHelloBalance();
//     fetchStakeInfo();
//     fetchIsAdmin();
//   }, [address, helloTokenAddress, helloTokenDecimals]);

//   useEffect(() => {
//     if (isConnected && address) {
//       // Store the wallet address in a cookie
//       Cookies.set("user_wallet", address, { path: "/" });
//     } else {
//       // Remove the wallet address cookie on disconnect
//       Cookies.remove("user_wallet", { path: "/" });
//     }
//   }, [address, isConnected]);

//   return <>{children}</>;
// };

// export default InitProvider;
