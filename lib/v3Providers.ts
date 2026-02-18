import { contractConfig } from "@/config/blockchain.config";
import { ContractConfigItemType } from "@/interfaces/index.i";
import { BaseProvider } from "@ethersproject/providers";
import { ethers } from "ethers";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { useAccount } from "wagmi";

// const { chainId, chain } = useAccount();
// const chainContractConfig: ContractConfigItemType =
//   contractConfig[chainId || "default"];

// const client = createPublicClient({
//   chain: chain,
//   transport: http(chainContractConfig.publicClientApi as string),
// });

// const provider = new ethers.providers.JsonRpcProvider(
//   chainContractConfig.publicClientApi as string
// );
// chainContractConfig?.publicClientApi!
const provider = new ethers.providers.JsonRpcProvider(
  "https://bsc-testnet.infura.io/v3/00de74a63d9043f994b7cf455ee1e5af"
);

// "https://mainnet.infura.io/v3/00de74a63d9043f994b7cf455ee1e5af"

export function getChainProvider(): any {
  return provider;
}
