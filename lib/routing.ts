// // import {
// //   AlphaRouter,
// //   SwapOptionsSwapRouter02,
// //   SwapRoute,
// //   SwapType,
// // } from "@uniswap/smart-order-router";

// // import { Address, formatUnits, parseUnits } from "viem";
// // // import { getChainProvider } from "@/lib/v3Providers";
// // import { TokenType } from "@/interfaces/index.i";
// // import { ethers } from "ethers";
// // import JSBI from "jsbi";
// // import {
// //   Fetcher,
// //   Route,
// //   Trade,
// //   TradeType,
// //   Token,
// //   CurrencyAmount,
// //   Percent,
// // } from "@pancakeswap/sdk";

// // export async function generateRoute({
// //   chainId,
// //   address,
// //   fromToken,
// //   toToken,
// //   fromTokenInputAmount,
// //   getChainProvider,
// //   chainContractConfig,
// // }: {
// //   chainId: number;
// //   address: Address;
// //   fromToken: TokenType;
// //   toToken: TokenType;
// //   fromTokenInputAmount: string;
// //   getChainProvider: () => any;
// //   chainContractConfig: any;
// // }): Promise<SwapRoute | null> {
// //   console.log("wish router call");
// //   // console.log("wish getChainProvider()", getChainProvider());

// //   const mchainid = 1;
// //   try {
// //     console.log("wish alpha router call chainID", chainId);
// //     const provider = getChainProvider();
// //     const router = new AlphaRouter({
// //       chainId: chainId,
// //       provider: provider,
// //     });

// //     try {
// //       const gasEstimate = await provider.estimateGas({
// //         to: chainContractConfig.quoterContractAddress,
// //         data: chainContractConfig.quoterContractABI, // Encoded ABI for the quote function
// //       });
// //       console.log(`Gas Estimate: ${gasEstimate.toString()}`);
// //     } catch (error: any) {
// //       console.error("Gas Estimation Error:", error.reason || error.message);
// //     }
// //     // console.log("wish server: get alpha router", router);
// //     console.log("wish server: route", router);

// //     const options: SwapOptionsSwapRouter02 = {
// //       recipient: address,
// //       slippageTolerance: new Percent(50, 10_000),
// //       deadline: Math.floor(Date.now() / 1000 + 1800),
// //       type: SwapType.SWAP_ROUTER_02,
// //     };

// //     console.log("wish server: options", options);

// //     const tokenIn = new Token(
// //       fromToken.chainId,
// //       fromToken.address,
// //       fromToken.decimals,
// //       fromToken.symbol,
// //       fromToken.name
// //     );

// //     const tokenOut = new Token(
// //       toToken.chainId,
// //       toToken.address,
// //       toToken.decimals,
// //       toToken.symbol,
// //       toToken.name
// //     );

// //     // Convert input amount to raw amount

// //     console.log("Input Values:");
// //     console.log("Token A:", tokenIn);
// //     console.log("From Token Input Amount:", fromTokenInputAmount);
// //     console.log("From Token Decimals:", fromToken.decimals);
// //     const rawAmount = parseUnits(
// //       fromTokenInputAmount,
// //       fromToken.decimals
// //     ).toString();
// //     console.log("Parsed Raw Amount (fromTokenInputAmount):", rawAmount);

// //     // Create CurrencyAmount object
// //     const currencyAmount = CurrencyAmount.fromRawAmount(tokenOut, rawAmount);
// //     console.log("CurrencyAmount Created:", currencyAmount);

// //     // Log the target token and options
// //     console.log("Token B:", tokenOut);
// //     console.log("Trade Type:", TradeType.EXACT_INPUT);
// //     console.log("Options:", options);

// //     try {
// //       const route = await router.route(
// //         CurrencyAmount.fromRawAmount(tokenIn, parseUnits(fromTokenInputAmount, fromToken.decimals).toString()),
// //         tokenOut,
// //         TradeType.EXACT_INPUT,
// //         options
// //       );
// //       console.log("Generated Route:", route);
// //       return route;
// //     } catch (error) {
// //       console.error("Route Generation Error:", error);
// //       return null;
// //     }
// //     // const route = await router.route(
// //     //   CurrencyAmount.fromRawAmount(
// //     //     tokenIn,
// //     //     parseUnits(fromTokenInputAmount, fromToken.decimals).toString()
// //     //   ),
// //     //   tokenOut,
// //     //   TradeType.EXACT_INPUT,
// //     //   options
// //     // );

// //     console.log("wish Generated Route:", route);
// //     return route;
// //   } catch (error) {
// //     console.error("wish Error generating route:", error);
// //     return null;
// //   }
// // }

// // export async function fetchGasEstimates({
// //   publicClient,
// // }: {
// //   publicClient: any;
// // }) {
// //   console.log("🚀 Initiating gas estimation process...");

// //   try {
// //     if (!publicClient) {
// //       throw new Error(
// //         "❌ Public client is not available. Ensure you are connected to the blockchain."
// //       );
// //     }

// //     console.log("✅ Public client initialized.");

// //     // Fetch the latest block
// //     const block = await publicClient.getBlock({ blockTag: "latest" });

// //     if (!block || !block.baseFeePerGas) {
// //       throw new Error(
// //         "❌ Failed to fetch the latest block or Base Fee is unavailable."
// //       );
// //     }

// //     console.log("📦 Latest block data retrieved:", block);

// //     // Extract Base Fee in wei
// //     const baseFeePerGas = block.baseFeePerGas;
// //     console.log("⛽ Base Fee Per Gas (Wei):", baseFeePerGas);

// //     // Define Max Priority Fee (default: 2 Gwei, adjustable)
// //     const maxPriorityFeePerGas = parseUnits("2", 9); // 2 Gwei in Wei
// //     console.log("✨ Max Priority Fee Per Gas (Wei):", maxPriorityFeePerGas);

// //     // Calculate Max Fee (Base Fee + Max Priority Fee)
// //     const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;
// //     console.log("💰 Max Fee Per Gas (Wei):", maxFeePerGas);

// //     // Format values to Gwei for better readability
// //     const formattedBaseFee = formatUnits(baseFeePerGas, 9); // Gwei
// //     const formattedMaxPriorityFee = formatUnits(maxPriorityFeePerGas, 9); // Gwei
// //     const formattedMaxFee = formatUnits(maxFeePerGas, 9); // Gwei

// //     console.log("🌟 Gas Estimates (Gwei):", {
// //       baseFeePerGas: formattedBaseFee,
// //       maxPriorityFeePerGas: formattedMaxPriorityFee,
// //       maxFeePerGas: formattedMaxFee,
// //     });

// //     // Return formatted values
// //     return {
// //       baseFeePerGas: formattedBaseFee,
// //       maxPriorityFeePerGas: formattedMaxPriorityFee,
// //       maxFeePerGas: formattedMaxFee,
// //     };
// //   } catch (error) {
// //     console.error("❌ Error during gas estimation:", error);
// //     throw error;
// //   }
// // }

// // import { AlphaRouter, SwapRoute, SwapType } from "@uniswap/smart-order-router";
// import {
//   SmartRouter,
//   SmartRouterTrade,
//   SMART_ROUTER_ADDRESSES,
//   SwapRouter,
// } from "@pancakeswap/smart-router";
// import {
//   Fetcher,
//   Route,
//   // Trade,
//   TradeType,
//   Token,
//   CurrencyAmount,
//   // computePairAddress,
//   Percent,
// } from "@pancakeswap/sdk";
// import {
//   computePoolAddress,
//   Pool,
//   Route as PancakeRoute,
//   Trade,
// } from "@pancakeswap/v3-sdk";
// import { Abi, getContract, parseUnits } from "viem";
// import JSBI from "jsbi";
// import { Address } from "viem";
// import { TokenType } from "@/interfaces/index.i";
// import { getPublicClient, readContract } from "@wagmi/core";
// import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// // import { computePairAddress } from "./pairtt";
// import { ERC20Token } from "@pancakeswap/swap-sdk-evm";
// export async function generateRoute({
//   chainId,
//   address,
//   fromToken,
//   toToken,
//   fromTokenInputAmount,
//   getChainProvider,
//   // chainContractConfig,
//   factoryAddresv3,
//   config,
//   factoryAbi,
// }: {
//   chainId: number;
//   address: Address;
//   fromToken: TokenType;
//   toToken: TokenType;
//   fromTokenInputAmount: string;
//   getChainProvider: () => any;
//   factoryAddresv3: Address;
//   // chainContractConfig: any;
//   config: any;
//   factoryAbi: any;
// }): Promise<SwapRouter | null | any> {
//   console.log("Generating route...");

//   const client = getPublicClient(config);
//   const provider = getChainProvider();
//   console.log("Provider initialized:", provider);

//   // Use Uniswap AlphaRouter for supported chains
//   // if (![56, 97].includes(chainId)) {
//   //   console.log("Using AlphaRouter for chain:", chainId);
//   //   const router = new AlphaRouter({ chainId, provider });
//   //   console.log("new router", router);

//   //   const options = {
//   //     recipient: address,
//   //     slippageTolerance: new Percent(50, 10_000),
//   //     deadline: Math.floor(Date.now() / 1000 + 1800),
//   //     type: SwapType.SWAP_ROUTER_02,
//   //   };

//   //   try {
//   //     const tokenIn = new Token(
//   //       chainId,
//   //       fromToken.address as Address,
//   //       fromToken.decimals,
//   //       fromToken.symbol,
//   //       fromToken.name
//   //     );
//   //     const tokenOut = new Token(
//   //       chainId,
//   //       toToken.address as Address,
//   //       toToken.decimals,
//   //       toToken.symbol,
//   //       toToken.name
//   //     );
//   //     const rawAmount = parseUnits(
//   //       fromTokenInputAmount,
//   //       fromToken.decimals
//   //     ).toString();
//   //     const amount = CurrencyAmount.fromRawAmount(tokenIn, rawAmount);

//   //     console.log("Routing Parameters:", {
//   //       tokenIn,
//   //       tokenOut,
//   //       amount,
//   //       options,
//   //     });
//   //     const route = await router.route(
//   //       amount,
//   //       tokenOut,
//   //       TradeType.EXACT_INPUT,
//   //       options
//   //     );
//   //     console.log("Generated Route:", route);

//   //     return route;
//   //   } catch (error) {
//   //     console.error("Error generating Uniswap route:", error);
//   //     return null;
//   //   }
//   // }

//   // Use PancakeSwap SDK for BSC (56 - Mainnet, 97 - Testnet)

//   console.log("Using PancakeSwap for chain:", chainId);
//   try {
//     const tokenIn = new Token(
//       chainId,
//       fromToken.address as Address,
//       fromToken.decimals,
//       fromToken.symbol,
//       fromToken.name
//     );

//     const tokenOut = new Token(
//       chainId,
//       toToken.address as Address,
//       toToken.decimals,
//       toToken.symbol,
//       toToken.name
//     );

//     const rawAmount = parseUnits(
//       fromTokenInputAmount,
//       fromToken.decimals
//     ).toString();
//     const amount = CurrencyAmount.fromRawAmount(tokenIn, rawAmount);
//     console.log("tokens sets", tokenIn, tokenOut);
//     console.log("publicClient", client, factoryAddresv3);

//     // Compute pool address for PancakeSwap V3
//     // const poolAddress = computePoolAddress({
//     //   deployerAddress: factoryAddresv3, // PancakeSwap V3 Factory Address
//     //   tokenA: tokenIn,
//     //   tokenB: tokenOut,
//     //   fee: 500, // 0.3% fee tier
//     // });

//     const poolAddress = await readContract(config, {
//       address: factoryAddresv3 as Address,
//       abi: factoryAbi as any,
//       functionName: "getPool",
//       args: [tokenIn.address, tokenOut.address!, 500],
//     });

//     console.log(poolAddress);

//     const poolContract = getContract({
//       address: poolAddress as `0x${string}`,
//       abi: IUniswapV3PoolABI.abi as Abi,
//       client: client,
//     });

//     console.log("poolContract", poolContract);

//     let r1: any, r2: any;

//     console.log(poolContract.address);

//     // if (poolContract) {
//     async function getPoolData() {
//       const result = (await readContract(config, {
//         address: poolContract.address as Address,
//         abi: poolContract.abi!,
//         functionName: "slot0",
//       })) as [bigint, number, number, number, number, number, boolean];

//       console.log("wish result", result);
//       r1 = result;

//       const result2 = (await readContract(config, {
//         address: poolContract.address as Address,
//         abi: poolContract.abi!,
//         functionName: "liquidity",
//       })) as number;

//       console.log("wish result", result2);
//       console.log("Computed Pool Address:", poolAddress);
//       r2 = result2;
//     }

//     // Call the function properly
//     const testpool = await getPoolData();
//     console.log("testpool", testpool);

//     // Fetch Pool Data (Replace with actual fetch logic from PancakeSwap SDK)
//     // const poolData = await provider.getPool(poolAddress);

//     if (!r1) {
//       console.error("Pool not found.");
//       return null;
//     }
//     const pool = new Pool(tokenIn, tokenOut, 500, r1[0], r2!, r1[1]);

//     // Generate Route

//     const route = new PancakeRoute([pool], tokenIn, tokenOut);
//     // const trade = new PancakeTrade(route, amount, TradeType.EXACT_INPUT);

//     const routes = [
//       {
//         amount: amount,
//         route: route,
//       },
//     ];

//     console.log("route", route);

//     // const trade = new Trade.fromRoutes(route, amount, TradeType.EXACT_INPUT);

//     // console.log("Generated PancakeSwap Route:", trade);
//     // return trade;
//     // const pair = await Fetcher.fetchPairData(tokenIn, tokenOut, provider);
//     // console.log("pack pair", pair);
//     // const facAddress = `0x${chainContractConfig.factoryAddress}`;
//     // const testobj = {
//     //   factoryAddress: factoryAddresv3,
//     //   tokenA: tokenIn,
//     //   tokenB: tokenOut,
//     // };
//     // console.log(testobj);

//     // const pairt = computePairAddress(testobj);
//     // console.log("pairt", pairt);

//     // const route = new Route([pairt], tokenIn, tokenOut);
//     // console.log("pack route", route);

//     // const inputAmount = parseUnits(
//     //   fromTokenInputAmount,
//     //   fromToken.decimals
//     // ).toString();

//     // const trade = new Trade(route, amount, TradeType.EXACT_INPUT);

//     // console.log("Generated PancakeSwap Route:", trade);
//     return route;
//   } catch (error) {
//     console.error("Error generating PancakeSwap route:", error);
//     return null;
//   }
// }

// // import { TradeType, CurrencyAmount, Percent, Token } from "@uniswap/sdk-core";
// // export async function generateRoute1({
// //   chainId,
// //   address,
// //   fromToken,
// //   toToken,
// //   fromTokenInputAmount,
// //   getChainProvider,
// //   chainContractConfig,
// // }: {
// //   chainId: number;
// //   address: Address;
// //   fromToken: TokenType;
// //   toToken: TokenType;
// //   fromTokenInputAmount: string;
// //   getChainProvider: () => any;
// //   chainContractConfig: any;
// // }): Promise<SwapRoute | null> {
// //   console.log("Generating route...");

// //   const provider = getChainProvider();
// //   console.log("provider", provider);

// //   const router = new AlphaRouter({ chainId, provider });

// //   console.log("Provider and Router initialized:", { provider, router });

// //   const options: SwapOptionsSwapRouter02 = {
// //     recipient: address,
// //     slippageTolerance: new Percent(50, 10000),
// //     deadline: Math.floor(Date.now() / 1000 + 1800),
// //     type: SwapType.SWAP_ROUTER_02,
// //   };

// //   try {
// //     // Validate tokens
// //     // if (
// //     //   !ethers.utils.isAddress(fromToken.address) ||
// //     //   !ethers.utils.isAddress(toToken.address)
// //     // ) {
// //     //   throw new Error("Invalid token address.");
// //     // }
// //     let inputToken =
// //       fromToken?.address === "native"
// //         ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
// //         : fromToken.address;
// //     const tokenIn = new Token(
// //       chainId,
// //       inputToken as Address,
// //       fromToken.decimals,
// //       fromToken.symbol,
// //       fromToken.name
// //     );
// //     const tokenOut = new Token(
// //       chainId,
// //       toToken.address as Address,
// //       toToken.decimals,
// //       toToken.symbol,
// //       toToken.name
// //     );

// //     const rawAmount = parseUnits(
// //       fromTokenInputAmount,
// //       fromToken.decimals
// //     ).toString();
// //     const amount = CurrencyAmount.fromRawAmount(tokenIn, rawAmount);

// //     console.log("Routing Parameters:", { tokenIn, tokenOut, amount, options });

// //     const route = await router.route(
// //       amount,
// //       tokenOut,
// //       TradeType.EXACT_INPUT,
// //       options
// //     );
// //     console.log("Generated Route:", route);

// //     return route;
// //   } catch (error) {
// //     console.error("Error generating route:", error);
// //     return null;
// //   }
// // }
