import { contractConfig } from "@/config/blockchain.config";
import { ContractConfigItemType, TokenType } from "@/interfaces/index.i";
import { writeContract } from "@wagmi/core";
import {
  Abi,
  Address,
  createPublicClient,
  formatUnits,
  getContract,
  http,
  parseAbi,
} from "viem";
import { useAccount, useConfig } from "wagmi";
import { useSwapStore } from "@/store/useDexStore";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { computePoolAddress, FeeAmount } from "@uniswap/v3-sdk";
import { Token } from "@uniswap/sdk-core";
import { mainnet } from "viem/chains";
import { ethers } from "ethers";
import { parseUnits } from "viem";

export async function quote(): Promise<any> {
  const { fromToken, toToken, fromTokenInputAmount } = useSwapStore();
  const config = useConfig();
  const { address, chainId } = useAccount();
  const chainContractConfig: ContractConfigItemType =
    contractConfig[chainId || "default"];

  //   const poolConstants = await getPoolConstants();

  const result = await writeContract(config, {
    address: chainContractConfig.quoterContractAddress as Address,
    abi: chainContractConfig.quoterContractABI,
    functionName: "quoteExactInputSingle",
    args: [
      //   poolConstants.token0,
      //   poolConstants.token1,
      //   poolConstants.fee,
      parseUnits(fromTokenInputAmount, fromToken?.decimals as number),
      0,
    ],
    chainId: chainId,
  });

  // console.log("wish", result);

  //   const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
  //     poolConstants.token0,
  //     poolConstants.token1,
  //     poolConstants.fee,
  //     fromReadableAmount(
  //       CurrentConfig.tokens.amountIn,
  //       CurrentConfig.tokens.in.decimals
  //     ).toString(),
  //     0
  //   );

  // return formatUnits(result as bigint, toToken?.decimals)
}

// async function getPoolConstants(): Promise<{
//   token0: string;
//   token1: string;
//   fee: number;
// }> {
//   const { chainId } = useAccount();
//   const { fromToken, toToken, fromTokenInputAmount } = useSwapStore();
//   const chainContractConfig: ContractConfigItemType =
//     contractConfig[chainId || "default"];

//   const tokenA = new Token(
//     fromToken?.chainId! as number,
//     fromToken?.address!,
//     fromToken?.decimals!,
//     fromToken?.symbol!,
//     fromToken?.name
//   );

//   const tokenB = new Token(
//     toToken?.chainId! as number,
//     toToken?.address!,
//     toToken?.decimals!,
//     toToken?.symbol!,
//     toToken?.name
//   );

//   const currentPoolAddress = computePoolAddress({
//     factoryAddress: chainContractConfig.v3FactoryAddress as Address,
//     tokenA: tokenA,
//     tokenB: tokenB,
//     fee: FeeAmount.MEDIUM,
//   });

//   // Parse the ABI and create the contract instance using wagmi
//   //   const poolContract = getContract({
//   //     address: currentPoolAddress as `0x${string}`,
//   //     abi: IUniswapV3PoolABI.abi as Abi,
//   //     client: publicClient,
//   //   });

// //   const poolContract = new ethers.Contract(
// //     currentPoolAddress,
// //     IUniswapV3PoolABI.abi,
// //     getProvider()
// //   );
// //   const [token0, token1, fee] = await Promise.all([
// //     // poolContract.token0(),
// //     // poolContract.token1(),
// //     // poolContract.fee(),
// //   ]);

// //   return {
// //     token0,
// //     token1,
// //     fee,
// //   };
// }

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// export function getProvider(): any {
//   return new ethers.JsonRpcProvider(
//     '"https://mainnet.infura.io/v3/00de74a63d9043f994b7cf455ee1e5af"'
//   );
// }
