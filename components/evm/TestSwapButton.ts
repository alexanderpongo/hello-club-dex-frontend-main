import { Address } from "viem";

// Hardcoded Base chain configuration for testing (like in the script)
export const BASE_CHAIN_CONFIG = {
  chainId: 8453,
  v3RouterAddress: "0x23F51850711accE31F6B0b6fBbA8a5eEbfc205dB" as Address,
  v3FactoryAddress: "0x044963D0eA07aCCf3c4349a72811a42ACc2369d1" as Address,
  v3QuoterAddress: "0xe1210b50D8c4b880aDcb8A32Ee70A181229AACF6" as Address,
  v3PositionManagerAddress:
    "0x60d40Eaf366c42B24719296b5A1Fe86ea9d1D91e" as Address,
  WETH_ADDRESS: "0x4200000000000000000000000000000000000006" as Address,
  explorerURL: "https://basescan.org",
  publicClientApi:
    "https://base-mainnet.core.chainstack.com/b683914d8e81cb071b21dbcfe8ec16cd",
  v3RouterABI: [
    {
      inputs: [
        {
          components: [
            { internalType: "address", name: "tokenIn", type: "address" },
            { internalType: "address", name: "tokenOut", type: "address" },
            { internalType: "uint24", name: "fee", type: "uint24" },
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "deadline", type: "uint256" },
            { internalType: "uint256", name: "amountIn", type: "uint256" },
            {
              internalType: "uint256",
              name: "amountOutMinimum",
              type: "uint256",
            },
            {
              internalType: "uint160",
              name: "sqrtPriceLimitX96",
              type: "uint160",
            },
          ],
          internalType: "struct ISwapRouter.ExactInputSingleParams",
          name: "params",
          type: "tuple",
        },
      ],
      name: "exactInputSingle",
      outputs: [
        { internalType: "uint256", name: "amountOut", type: "uint256" },
      ],
      stateMutability: "payable",
      type: "function",
    },
  ],
};
