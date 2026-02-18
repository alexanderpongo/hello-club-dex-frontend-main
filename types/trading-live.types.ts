import { Hex } from "viem";

export type PoolTypes = {
  amount0: string;
  amount1: string;
  blockNumber: string;
  blockTimestamp: string;
  id: string;
  liquidity: string;
  owner: Hex;
  tokenId: string;
  transactionHash: string;
};

export type PoolsDataResponse = {
  status: number;
  message: string;
  data: PoolTypes[];
};

export type singlePoolDataResponse = {
  status: number;
  message: string;
  data: PoolTypes;
};

export type ProcessedPoolType = {
  result: any;
  slot0: any;
  token0: {
    address: any;
    name: string;
    symbol: string;
    decimal: number;
    logoURI: string;
  };
  token1: {
    address: any;
    name: string;
    symbol: string;
    decimal: number;
    logoURI: string;
  };
  chainId: number;
  amount0: string;
  amount1: string;
  blockNumber: string;
  blockTimestamp: string;
  id: string;
  liquidity: string;
  owner: `0x${string}`;
  tokenId: string;
  transactionHash: string;
  poolAddress: `0x${string}`;
};

export type ProcessedPoolsType = {
  result: any;
  token0: {
    address: any;
    name: string;
    symbol: string;
    decimal: number;
    logoURI: string;
  };
  token1: {
    address: any;
    name: string;
    symbol: string;
    decimal: number;
    logoURI: string;
  };
  chainId: number;
  amount0: string;
  amount1: string;
  blockNumber: string;
  blockTimestamp: string;
  id: string;
  liquidity: string;
  owner: `0x${string}`;
  tokenId: string;
  transactionHash: string;
  poolAddress: `0x${string}`;
};






