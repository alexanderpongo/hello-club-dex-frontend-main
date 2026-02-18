import { z } from "zod";

const tokenSchema = z.object({
  address: z.string().nonempty(),
  chainId: z.number(),
  decimals: z.number(),
  logoURI: z.string().url(),
  name: z.string().nonempty(),
  symbol: z.string().nonempty(),
});

export const dataSchema = z.object({
  id: z.string().nonempty(),
  token1: tokenSchema,
  token2: tokenSchema,
  chainId: z.number(),
  version: z.string().nonempty(),
  transactionHash: z.string().nonempty(),
  percentage: z.string().regex(/^\d+(\.\d+)?%$/), // validates a percentage string
  TVL: z.string().regex(/^\$\d+(\.\d+)?[mk]?$/), // validates TVL format
  volume24: z.string().regex(/^\$\d+(\.\d+)?[mk]?$/), // validates volume24 format
  volumeW: z.string().regex(/^\$\d+(\.\d+)?[mk]?$/), // validates volumeW format
  volumeM: z.string().regex(/^\$\d+(\.\d+)?[mk]?$/), // validates volumeM format
});

export type Pool = z.infer<typeof dataSchema>;

const lpAddedSchema = z.object({
  id: z.string().nonempty(),
  tokenA: z.string().nonempty(),
  tokenB: z.string().nonempty(),
  pair: z.string().nonempty(),
  transactionHash: z.string().nonempty(),
  blockTimestamp: z.string().regex(/^\d+$/), // validates that blockTimestamp is a string of digits
  blockNumber: z.string().regex(/^\d+$/), // validates that blockNumber is a string of digits
});

export type LPAdded = z.infer<typeof lpAddedSchema>;

const feeCollectSchema = z.object({
  amount0: z.string().nonempty(),
  amount1: z.string().nonempty(),
  blockTimestamp: z.string().regex(/^\d+$/), // validates that blockTimestamp is a string of digits
  id: z.string().nonempty(),
  recipient: z.string().nonempty(),
  tokenId: z.string().nonempty(),
});

export type FeeCollect = z.infer<typeof feeCollectSchema>;
