// import { TIER_METADATA } from "@/constants/TierMetadata";
import { User } from "@/store";
import { TaskAction } from "@/types/enums";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CurrencyAmount, Token } from "@uniswap/sdk-core";
import { Pool, Position, TICK_SPACINGS } from "@uniswap/v3-sdk";
import JSBI from "jsbi";

import {
  signTypedData,
  getPublicClient,
  getAccount,
  getChainId,
} from "@wagmi/core";
import {
  Address,
  concatHex,
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  formatUnits,
  fromHex,
  Hex,
  parseAbiParameters,
  parseEther,
  parseGwei,
  parseUnits,
  toHex,
} from "viem";
import {
  SinglePoolData,
  SingleTokenInfo,
} from "@/types/trading-live-table.types";
import { IPool, TokenInfo } from "@/types/my-positions.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateMiddle(
  text: string,
  startChars: number = 4,
  endChars: number = 4
): string {
  if (!text) return "";
  if (text.length <= startChars + endChars) {
    return text; // No truncation needed
  }
  return `${text.slice(0, startChars)}...${text.slice(-endChars)}`;
}

// export const getTierId = (number: number): number | null => {
//   const tier = TIER_METADATA.slice() // Create a copy of the array
//     .reverse() // Reverse to prioritize the highest thresholds
//     .find((tier) => number > tier.threshold); // Find the first tier where the number is greater to the threshold
//   return tier ? tier.id : null; // Return the id if found, else null
// };

export function abbreviateNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"; // Billions
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M"; // Millions
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K"; // Thousands
  }
  return num.toLocaleString(); // Less than 1,000
}

// export function getInitials(name: string): string {
//   const words = name.split(" ");
//   // Check if we have at least two words, otherwise return the first letter of the first word
//   if (words.length >= 2) {
//     return (words[0][0] + words[1][0]).toUpperCase();
//   } else if (words.length === 1 && words[0]) {
//     return words[0][0].toUpperCase();
//   }

//   return ""; // Return empty string if name is empty or undefined
// }

export type PancakeToken = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  logoURI: string;
  [key: string]: any;
};

// export const getTokenLogo = async (
//   tokenAddress: string,
//   url: string
// ): Promise<string | null> => {
//   try {
//     const res = await fetch(url);
//     if (!res.ok) throw new Error("Failed to fetch token list");

//     const data: PancakeToken[] = await res.json();

//     const token = data.find(
//       (t) => t.address.toLowerCase() === tokenAddress.toLowerCase()
//     );

//     return token?.logoURI || null;
//   } catch (error) {
//     console.error("Error fetching  token list:", error);
//     return null;
//   }
// };

export function getInitials(name: string): string {
  if (!name || typeof name !== "string") return "";

  const words = name.trim().split(" ").filter(Boolean);

  if (words.length >= 2) {
    const first = words[0][0] ?? "";
    const second = words[1][0] ?? "";
    return (first + second).toUpperCase();
  } else if (words.length === 1 && words[0]) {
    return (words[0][0] ?? "").toUpperCase();
  }

  return "";
}

export function extractUsername(email: string) {
  if (!email || typeof email !== "string") {
    return ""; // Return empty string for invalid input
  }

  const parts = email.split("@");
  return parts.length > 1 ? parts[0] : email; // Return the part before '@' or the entire string if no '@' exists
}

export const getReasonString = (
  taskAction: TaskAction,
  userProfileDetails: User
) => {
  const messages = {
    twitter: "You must connect your Twitter account to verify this task.",
    discord: "You must connect your Discord account to verify this task.",
    telegram: "You must connect your Telegram account to verify this task.",
  };

  const needsTwitter = [TaskAction.COMMENT_TWEET, TaskAction.RETWEET].includes(
    taskAction
  );
  const needsDiscord = taskAction === TaskAction.JOIN_DISCORD_CHANNEL;
  const needsTelegram = taskAction === TaskAction.JOIN_TELEGRAM_CHANNEL;

  if (needsTwitter && !userProfileDetails.twitter_handle) {
    return messages.twitter;
  }
  if (needsDiscord && !userProfileDetails.discord_id) {
    return messages.discord;
  }
  if (needsTelegram && !userProfileDetails.telegram_id) {
    return messages.telegram;
  }
};

export function isValidTwitterPost(url: string): boolean {
  const regex =
    /^https?:\/\/(www\.)?x\.com\/[A-Za-z0-9_]{1,15}\/status\/\d+\/?$/;
  return regex.test(url);
}

export function isValidDiscordInvite(url: string): boolean {
  const regex =
    /^https?:\/\/(www\.)?discord(?:\.gg|\.com\/invite)\/[a-zA-Z0-9]+$/;
  return regex.test(url);
}

export function isValidTelegramInvite(url: string): boolean {
  const regex = /^https?:\/\/t\.me\/[a-zA-Z0-9_]+(\/\d+)?$/;
  return regex.test(url);
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

/**
 * Calculate precise relative time from now (e.g., "1 year and 3 days", "5 months and 2 days", "15 days")
 */
export function getRelativeTimeFromNow(date: Date): string {
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();

  // If the date is in the past, return "Already passed"
  if (diffInMs <= 0) {
    return "Already passed";
  }

  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  // Calculate years, months, and remaining days more accurately
  const years = Math.floor(diffInDays / 365);
  const remainingDaysAfterYears = diffInDays % 365;
  const months = Math.floor(remainingDaysAfterYears / 30);
  const days = remainingDaysAfterYears % 30;

  // Build the result string with precise breakdown
  const parts: string[] = [];

  if (years > 0) {
    parts.push(years === 1 ? "1 year" : `${years} years`);
  }

  if (months > 0) {
    parts.push(months === 1 ? "1 month" : `${months} months`);
  }

  if (days > 0) {
    parts.push(days === 1 ? "1 day" : `${days} days`);
  }

  // If no parts (shouldn't happen with our logic), return "Today"
  if (parts.length === 0) {
    return "Today";
  }

  // Join parts with "and" for the last element
  if (parts.length === 1) {
    return parts[0];
  } else if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  } else {
    // For 3 parts (years, months, and days)
    return `${parts[0]}, ${parts[1]} and ${parts[2]}`;
  }
}

// export async function getPermitSignature({
//   token,
//   spender,
//   signer,
//   amount ,
//   expirationSeconds = 3600,
// }: {
//   token: string;
//   spender: string;
//   signer: ethers.Signer;
//   amount?: bigint;
//   expirationSeconds?: number;
// }): Promise<{
//   signature: string;
//   permit: PermitSingle;
// }> {
//   const address = await signer.getAddress();
//   const { chainId } = await signer.provider!.getNetwork();
//   const deadline = Math.floor(Date.now() / 1000) + expirationSeconds;

//   const permit: PermitSingle = {
//     details: {
//       token,
//       amount,
//       expiration: deadline,
//       nonce: 0,
//     },
//     spender,
//     sigDeadline: deadline,
//   };

//   const PERMIT2_ADDRESS = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

//   const { domain, types, values } = AllowanceTransfer.getPermitData(
//     permit,
//     PERMIT2_ADDRESS,
//     chainId
//   );

//   const signature = await signer._signTypedData(domain, types, values);

//   return {
//     signature,
//     permit,
//   };
// }

// constants
// const PERMIT2_ADDRESS = "0x31c2F6fcFf4F8759b3Bd5Bf0e1084A055615c768"; // mainnet Permit2

// export const getPermitSingleSignature = async ({
//   token,
//   amount,
//   spender,
//   client,
//   chainId,
//   address,
// }: {
//   token: Address;
//   amount: bigint;
//   spender: Address;
//   client: any;
//   chainId: number;
//   address: Address;
// }) => {
//   // const account = getAccount();
//   const userAddress = address as Address;

//   // const chainId = await getChainId();
//   // const client = getPublicClient();

//   // 1. Get correct nonce from Permit2
//   const nonce: bigint = await client
//     .readContract({
//       address: PERMIT2_ADDRESS,
//       abi: [
//         {
//           name: "allowance",
//           type: "function",
//           stateMutability: "view",
//           inputs: [
//             { name: "owner", type: "address" },
//             { name: "token", type: "address" },
//             { name: "spender", type: "address" },
//           ],
//           outputs: [
//             {
//               components: [
//                 { name: "amount", type: "uint160" },
//                 { name: "expiration", type: "uint48" },
//                 { name: "nonce", type: "uint48" },
//               ],
//               name: "details",
//               type: "tuple",
//             },
//           ],
//         },
//       ],
//       functionName: "allowance",
//       args: [userAddress, token, spender],
//     })
//     .then((res: any) => res.nonce);

//   // 2. Build PermitSingle object
//   const expiration = Math.floor(Date.now() / 1000 + 60 * 60 * 24 * 30); // 30 days
//   const sigDeadline = Math.floor(Date.now() / 1000 + 60 * 30); // 30 minutes

//   const permitSingle = {
//     details: {
//       token,
//       amount,
//       expiration,
//       nonce,
//     },
//     spender,
//     sigDeadline,
//   };

//   // 3. Build EIP-712 signature domain & types
//   const domain = {
//     name: "Permit2",
//     chainId,
//     verifyingContract: PERMIT2_ADDRESS as Addres,
//   };

//   const types = {
//     PermitDetails: [
//       { name: "token", type: "address" },
//       { name: "amount", type: "uint160" },
//       { name: "expiration", type: "uint48" },
//       { name: "nonce", type: "uint48" },
//     ],
//     PermitSingle: [
//       { name: "details", type: "PermitDetails" },
//       { name: "spender", type: "address" },
//       { name: "sigDeadline", type: "uint256" },
//     ],
//   };

//   // 4. Sign using viem/wagmi
//   const signature = await signTypedData(config, {
//     domain,
//     types,
//     primaryType: "PermitSingle",
//     message: permitSingle,
//   });

//   return {
//     permitSingle,
//     signature,
//   };
// };

export function toDecimalString(value: number | string) {
  return Number(value).toLocaleString("en-US", {
    useGrouping: false,
    maximumSignificantDigits: 21,
  });
}

type AdjustedAmounts = {
  amount0: CurrencyAmount<Token>;
  amount1: CurrencyAmount<Token>;
};

/**
 * Computes the adjusted token amounts for Uniswap V3 LP position
 */
export function getAdjustedAmountsForLP(params: {
  pool: Pool;
  tickLower: number;
  tickUpper: number;
  inputAmount0: any;
}): AdjustedAmounts {
  const { pool, tickLower, tickUpper, inputAmount0 } = params;

  const position = Position.fromAmount0({
    pool,
    tickLower,
    tickUpper,
    amount0: inputAmount0,
    useFullPrecision: true,
  });

  return {
    amount0: position.amount0,
    amount1: position.amount1,
  };
}
// utils/aggregator.ts

export async function findBestDexRoute(
  fromToken: string,
  toToken: string,
  amount: string
) {
  // Simulate a short delay (like an API call)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Dummy data — pretend we got these quotes from each DEX
  // If amountOut = 0 → means no liquidity
  const dummyQuotes = [
    { dex: "Uniswap", amountOut: Number(amount) * 0.98 },
    { dex: "SushiSwap", amountOut: Number(amount) * 0.97 }, // no liquidity
    { dex: "PancakeSwap", amountOut: Number(amount) * 0.96 }, // no liquidity
  ];

  // Filter out DEXs that have some liquidity
  const availableDexes = dummyQuotes.filter((q) => q.amountOut > 0);

  if (availableDexes.length === 0) {
    // No DEX has liquidity
    return {
      dexName: null,
      amountOut: "0",
      route: [],
      hasLiquidity: false,
    };
  }

  // Find best route by comparing output amounts
  const bestRoute = availableDexes.reduce((prev, curr) =>
    curr.amountOut > prev.amountOut ? curr : prev
  );

  return {
    dexName: bestRoute.dex,
    amountOut: bestRoute.amountOut.toFixed(4),
    route: [bestRoute.dex],
    hasLiquidity: true,
  };
}

export const getPositionOneOftheTokenPair = (
  poolData: SinglePoolData
): SingleTokenInfo => {
  // Logic to determine the position of the token based on price source
  if (
    poolData.token0.price_source === "calculated" &&
    poolData.token1.price_source === "native"
  ) {
    return poolData.token0;
  } else if (
    poolData.token0.price_source === "native" &&
    poolData.token1.price_source === "calculated"
  ) {
    return poolData.token1;
  } else if (
    poolData.token0.price_source === "calculated" &&
    poolData.token1.price_source === "stablecoin"
  ) {
    return poolData.token0;
  } else if (
    poolData.token0.price_source === "stablecoin" &&
    poolData.token1.price_source === "calculated"
  ) {
    return poolData.token1;
  } else if (
    poolData.token0.price_source === "stablecoin" &&
    poolData.token1.price_source === "stablecoin"
  ) {
    return poolData.token0;
  } else if (
    poolData.token0.price_source === "stablecoin" &&
    poolData.token1.price_source === "native"
  ) {
    return poolData.token0;
  } else if (
    poolData.token0.price_source === "native" &&
    poolData.token1.price_source === "stablecoin"
  ) {
    return poolData.token1;
  }

  return poolData.token0;
};

export const getPositionTwoOftheTokenPair = (
  poolData: SinglePoolData
): SingleTokenInfo => {
  if (
    poolData.token0.price_source === "calculated" &&
    poolData.token1.price_source === "native"
  ) {
    return poolData.token1;
  } else if (
    poolData.token0.price_source === "native" &&
    poolData.token1.price_source === "calculated"
  ) {
    return poolData.token0;
  } else if (
    poolData.token0.price_source === "calculated" &&
    poolData.token1.price_source === "stablecoin"
  ) {
    return poolData.token1;
  } else if (
    poolData.token0.price_source === "stablecoin" &&
    poolData.token1.price_source === "calculated"
  ) {
    return poolData.token0;
  } else if (
    poolData.token0.price_source === "stablecoin" &&
    poolData.token1.price_source === "stablecoin"
  ) {
    return poolData.token1;
  } else if (
    poolData.token0.price_source === "stablecoin" &&
    poolData.token1.price_source === "native"
  ) {
    return poolData.token1;
  } else if (
    poolData.token0.price_source === "native" &&
    poolData.token1.price_source === "stablecoin"
  ) {
    return poolData.token0;
  }
  return poolData.token1;
};

const STABLECOINS = {
  // BSC Stablecoins
  "0x55d398326f99059ff775485246999027b3197955": {
    symbol: "USDT",
    decimals: 18,
    value: 1.0,
  }, // BSC USDT
  "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": {
    symbol: "USDC",
    decimals: 18,
    value: 1.0,
  }, // BSC USDC
  "0xe9e7cea3dedca5984780bafc599bd69add087d56": {
    symbol: "BUSD",
    decimals: 18,
    value: 1.0,
  }, // BSC BUSD
  "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3": {
    symbol: "DAI",
    decimals: 18,
    value: 1.0,
  }, // BSC DAI

  // Ethereum Stablecoins
  "0xdac17f958d2ee523a2206206994597c13d831ec7": {
    symbol: "USDT",
    decimals: 6,
    value: 1.0,
  }, // ETH USDT
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": {
    symbol: "USDC",
    decimals: 6,
    value: 1.0,
  }, // ETH USDC
  "0x6b175474e89094c44da98b954eedeac495271d0f": {
    symbol: "DAI",
    decimals: 18,
    value: 1.0,
  }, // ETH DAI
  "0x4fabb145d64652a948d72533023f6e7a623c7c53": {
    symbol: "BUSD",
    decimals: 18,
    value: 1.0,
  }, // ETH BUSD

  // Base Stablecoins
  "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913": {
    symbol: "USDC",
    decimals: 6,
    value: 1.0,
  }, // Base USDC
  "0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca": {
    symbol: "USDbC",
    decimals: 6,
    value: 1.0,
  }, // Base USDbC (bridged)
};

// Wrapped native tokens
const WRAPPED_NATIVE = {
  bsc: {
    "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c": {
      symbol: "WBNB",
      isNative: true,
    },
  },
  ethereum: {
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": {
      symbol: "WETH",
      isNative: true,
    },
  },
  base: {
    "0x4200000000000000000000000000000000000006": {
      symbol: "WETH",
      isNative: true,
    },
  },
};

export const getPositionOneOftheTokenPairBasedOnTokenAddress = (
  poolData: IPool
): TokenInfo => {
  // Helper to classify token by address across supported chains
  const getCategory = (address?: string) => {
    if (!address) return "calculated" as const;
    const addr = address.toLowerCase();
    // Stablecoins across chains
    if (addr in STABLECOINS) return "stablecoin" as const;
    // Wrapped natives across chains
    const isNative = Object.values(WRAPPED_NATIVE).some((chainMap) =>
      Object.prototype.hasOwnProperty.call(chainMap, addr)
    );
    if (isNative) return "native" as const;
    // Fallback
    return "calculated" as const;
  };

  const token0Cat = getCategory(poolData.token0?.address);
  const token1Cat = getCategory(poolData.token1?.address);

  // Mirror the decision rules from getPositionOneOftheTokenPair using categories
  if (token0Cat === "calculated" && token1Cat === "native") {
    return poolData.token0;
  } else if (token0Cat === "native" && token1Cat === "calculated") {
    return poolData.token1;
  } else if (token0Cat === "calculated" && token1Cat === "stablecoin") {
    return poolData.token0;
  } else if (token0Cat === "stablecoin" && token1Cat === "calculated") {
    return poolData.token1;
  } else if (token0Cat === "stablecoin" && token1Cat === "stablecoin") {
    return poolData.token0;
  } else if (token0Cat === "stablecoin" && token1Cat === "native") {
    return poolData.token0;
  } else if (token0Cat === "native" && token1Cat === "stablecoin") {
    return poolData.token1;
  }

  return poolData.token0;
};

export const getPositionTwoOftheTokenPairBasedOnTokenAddress = (
  poolData: IPool
): TokenInfo => {
  // Helper to classify token by address across supported chains
  const getCategory = (address?: string) => {
    if (!address) return "calculated" as const;
    const addr = address.toLowerCase();
    if (addr in STABLECOINS) return "stablecoin" as const;
    const isNative = Object.values(WRAPPED_NATIVE).some((chainMap) =>
      Object.prototype.hasOwnProperty.call(chainMap, addr)
    );
    if (isNative) return "native" as const;
    return "calculated" as const;
  };

  const token0Cat = getCategory(poolData.token0?.address);
  const token1Cat = getCategory(poolData.token1?.address);

  // Mirror the decision rules from getPositionTwoOftheTokenPair using categories
  if (token0Cat === "calculated" && token1Cat === "native") {
    return poolData.token1;
  } else if (token0Cat === "native" && token1Cat === "calculated") {
    return poolData.token0;
  } else if (token0Cat === "calculated" && token1Cat === "stablecoin") {
    return poolData.token1;
  } else if (token0Cat === "stablecoin" && token1Cat === "calculated") {
    return poolData.token0;
  } else if (token0Cat === "stablecoin" && token1Cat === "stablecoin") {
    return poolData.token1;
  } else if (token0Cat === "stablecoin" && token1Cat === "native") {
    return poolData.token1;
  } else if (token0Cat === "native" && token1Cat === "stablecoin") {
    return poolData.token0;
  }

  return poolData.token1;
};

export function decimalStringToJSBI(amountStr: string, decimals = 18) {
  if (!amountStr || amountStr === ".") return JSBI.BigInt("0");

  // normalize (remove leading +, trim)
  const s = amountStr.trim().replace(/^\+/, "");

  // Validate basic numeric format (allow leading 0, decimal point)
  if (!/^\d+(\.\d+)?$/.test(s)) {
    throw new Error(`Invalid numeric string: "${amountStr}"`);
  }

  const [whole, fraction = ""] = s.split(".");
  // pad or trim fractional part to token decimals
  const frac = (fraction + "0".repeat(decimals)).slice(0, decimals);
  const combined = (whole === "0" ? "" : whole) + frac;
  const normalized = combined.replace(/^0+/, ""); // remove leading zeros
  return JSBI.BigInt(normalized === "" ? "0" : normalized);
}

// export const CUSTOM_TICK_SPACINGS = {
//   ...TICK_SPACINGS,
//   25000: 500,
// };

export const CUSTOM_TICK_SPACINGS: Record<number, number> = {
  ...(TICK_SPACINGS as Record<number, number>),
  25000: 500,
};

// Add/extend types for fee tiers and tick spacing lookups
export type FeeTier = 500 | 3000 | 10000 | 25000 | number;
export type TickSpacingsMap = Record<number, number>;

// Utility accessor (optional, safer typed lookup)
export async function getTickSpacingForFee(fee: number): Promise<number> {
  return CUSTOM_TICK_SPACINGS[fee];
}
