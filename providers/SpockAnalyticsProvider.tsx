// "use client";
// import { ReactNode, useEffect } from "react";
// import Web3Analytics from "analytics-web3";
// import { useAccount, useConfig, useChainId } from "wagmi";
// import { usePathname } from "next/navigation";

// interface SpockAnalyticsProviderProps {
//   children: ReactNode;
// }

// export default function SpockAnalyticsProvider({
//   children,
// }: SpockAnalyticsProviderProps) {
//   const config = useConfig();
//   const { address, isConnected } = useAccount();
//   const chainId = useChainId();
//   const pathname = usePathname();

//   useEffect(() => {
//     // Initialize Spock Analytics once
//     Web3Analytics.init({
//       appKey: process.env.NEXT_PUBLIC_SPOCK_ANALYTICS_KEY as string,
//       debug: process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? true : false, // Enables logs in the console
//     });

//     // Set Web3 provider if available
//     if (config) {
//       Web3Analytics.walletProvider(config);
//     }
//   }, [config]);

//   useEffect(() => {
//     // Track wallet connection when user connects
//     if (isConnected && address && chainId) {
//       Web3Analytics.trackWalletConnection("RainbowKit", address, chainId);
//     }
//   }, [isConnected, address, chainId]);

//   useEffect(() => {
//     // Track page views on pathname change
//     if (pathname) {
//       Web3Analytics.trackPageView(pathname);
//     }
//   }, [pathname]);

//   return <>{children}</>;
// }
