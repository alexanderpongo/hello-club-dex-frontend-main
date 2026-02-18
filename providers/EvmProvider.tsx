"use client";

import "@rainbow-me/rainbowkit/styles.css";
import * as React from "react";
import { useTheme } from "next-themes";
import { WagmiProvider } from "wagmi";
import { base, bsc, bscTestnet, mainnet } from "wagmi/chains";
import {
  darkTheme,
  getDefaultConfig,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  ledgerWallet,
  trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Custom RPC override with fallbacks to avoid viem errors when env vars are missing
const customBsc = {
  ...bsc,
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_BSC_RPC_ADDRESS || "https://binance.llamarpc.com",
      ],
    },
  },
};

const customBase = {
  ...base,
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_BASE_RPC_ADDRESS || "https://base.llamarpc.com",
      ],
    },
  },
};

const customMainnet = {
  ...mainnet,
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_RPC_ADDRESS || "https://eth.llamarpc.com",
      ],
    },
  },
};

const { wallets } = getDefaultWallets();

// Define chains configuration
const chains = [
  customBsc,
  customMainnet,
  customBase,
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" ? [bscTestnet] : []),
] as const;

// Create truly global singletons that persist across all re-renders and remounts
let globalWagmiConfig: ReturnType<typeof getDefaultConfig> | null = null;
let globalQueryClient: QueryClient | null = null;

const getGlobalWagmiConfig = () => {
  if (!globalWagmiConfig) {
    if (
      process.env.NODE_ENV === "development" &&
      typeof window !== "undefined"
    ) {
      console.log("🔗 Initializing Wagmi config (should only happen once)");
    }

    try {
      globalWagmiConfig = getDefaultConfig({
        appName: "Hello Club Dex",
        projectId: "b1871e0ecc3841cad28cea94d45d4cd6",
        wallets: [
          ...wallets,
          {
            groupName: "Other",
            wallets: [argentWallet, trustWallet, ledgerWallet],
          },
        ],
        chains: chains,
        ssr: true,
      });
    } catch (error) {
      if (
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined"
      ) {
        console.warn("⚠️ Error initializing Wagmi config:", error);
      }
      return null;
    }
  }
  return globalWagmiConfig;
};

const getGlobalQueryClient = () => {
  if (!globalQueryClient) {
    globalQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    });
  }
  return globalQueryClient;
};

export const EvmProvider = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    const config = getGlobalWagmiConfig();
    const queryClient = getGlobalQueryClient();

    if (!config) {
      return <>{children}</>;
    }

    const rainbowTheme = mounted
      ? resolvedTheme === "dark"
        ? darkTheme({
          accentColor: "#c2fe0c",
          accentColorForeground: "black",
          borderRadius: "medium",
          fontStack: "system",
          overlayBlur: "small",
        })
        : lightTheme({
          accentColor: "#9bcb0a",
          accentColorForeground: "white",
          borderRadius: "medium",
          fontStack: "system",
          overlayBlur: "small",
        })
      : darkTheme();

    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={rainbowTheme}
            modalSize="compact"
            initialChain={chains[0]}
          >
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
  }
);

EvmProvider.displayName = "EvmProvider";
