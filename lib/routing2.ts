import { SmartRouter, SwapRouter } from "@pancakeswap/smart-router";
import { CurrencyAmount, TradeType } from "@pancakeswap/swap-sdk-core";
import { ERC20Token } from "@pancakeswap/swap-sdk-evm";
import { Pool, Route as PancakeRoute } from "@pancakeswap/v3-sdk";
import { Abi, getContract, parseUnits } from "viem";
import { Address } from "viem";
import { TokenType } from "@/interfaces/index.i";
import { getPublicClient, readContract } from "@wagmi/core";
import IUniswapV3PoolABI from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
// import { computePairAddress } from "./pairtt";
export async function generateRoute({
  chainId,
  address,
  fromToken,
  toToken,
  fromTokenInputAmount,
  getChainProvider,
  // chainContractConfig,
  factoryAddresv3,
  config,
  factoryAbi,
  quoteProvider,
}: {
  chainId: number;
  address: Address;
  fromToken: TokenType;
  toToken: TokenType;
  fromTokenInputAmount: string;
  getChainProvider: () => any;
  factoryAddresv3: Address;
  // chainContractConfig: any;
  config: any;
  factoryAbi: any;
  quoteProvider: any;
}): Promise<SwapRouter | null | any> {
  console.log("Generating route...");

  const publicClient = getPublicClient(config);
  const provider = getChainProvider();
  console.log("Provider initialized:", provider);

  console.log("Using PancakeSwap for chain:", chainId);
  try {
    const tokenIn = new ERC20Token(
      chainId,
      fromToken.address as Address,
      fromToken.decimals,
      fromToken.symbol,
      fromToken.name
    );

    const tokenOut = new ERC20Token(
      chainId,
      toToken.address as Address,
      toToken.decimals,
      toToken.symbol,
      toToken.name
    );

    const rawAmount = parseUnits(
      fromTokenInputAmount,
      fromToken.decimals
    ).toString();
    const amount = CurrencyAmount.fromRawAmount(tokenIn, rawAmount);
    console.log("tokens sets", tokenIn, tokenOut);
    console.log("publicClient", publicClient, factoryAddresv3);

    const poolAddress = await readContract(config, {
      address: factoryAddresv3 as Address,
      abi: factoryAbi as any,
      functionName: "getPool",
      args: [tokenIn.address, tokenOut.address!, 500],
    });

    console.log(poolAddress);

    const poolContract = getContract({
      address: poolAddress as `0x${string}`,
      abi: IUniswapV3PoolABI.abi as Abi,
      client: publicClient,
    });

    console.log("poolContract", poolContract);

    let r1: any, r2: any;

    console.log(poolContract.address);

    // if (poolContract) {
    async function getPoolData() {
      const result = (await readContract(config, {
        address: poolContract.address as Address,
        abi: poolContract.abi!,
        functionName: "slot0",
      })) as [bigint, number, number, number, number, number, boolean];

      console.log("wish result", result);
      r1 = result;

      const result2 = (await readContract(config, {
        address: poolContract.address as Address,
        abi: poolContract.abi!,
        functionName: "liquidity",
      })) as number;

      console.log("wish result", result2);
      console.log("Computed Pool Address:", poolAddress);
      r2 = result2;
    }

    // Call the function properly
    const testpool = await getPoolData();
    console.log("testpool", testpool);

    if (!r1) {
      console.error("Pool not found.");
      return null;
    }
    // Create compatible Token objects for v3-sdk Pool
    const v3TokenIn = {
      ...tokenIn,
      asToken: tokenIn,
    } as any;

    const v3TokenOut = {
      ...tokenOut,
      asToken: tokenOut,
    } as any;

    const pool = new Pool(v3TokenIn, v3TokenOut, 500, r1[0], r2!, r1[1]);

    console.log("pool", pool);

    // Generate Route

    // const route = new PancakeRoute([pool], tokenIn, tokenOut);
    // const trade = new PancakeTrade(route, amount, TradeType.EXACT_INPUT);

    // const routes = [
    //   {
    //     amount: amount,
    //     route: route,
    //   },
    // ];

    // console.log("route", route);

    let pools: any[] = [];
    pools = [...pools, pool];

    console.log("pools", pools);

    const trade = await SmartRouter.getBestTrade(
      amount,
      tokenOut,
      TradeType.EXACT_INPUT,
      {
        gasPriceWei: () => publicClient.getGasPrice(),
        maxHops: 2,
        maxSplits: 2,
        poolProvider: SmartRouter.createStaticPoolProvider(pools),
        quoteProvider,
        quoterOptimization: true,
      }
    );

    console.log("Generated PancakeSwap trade:", trade);
    // return trade;
    // const pair = await Fetcher.fetchPairData(tokenIn, tokenOut, provider);
    // console.log("pack pair", pair);
    // const facAddress = `0x${chainContractConfig.factoryAddress}`;
    // const testobj = {
    //   factoryAddress: factoryAddresv3,
    //   tokenA: tokenIn,
    //   tokenB: tokenOut,
    // };
    // console.log(testobj);

    // const pairt = computePairAddress(testobj);
    // console.log("pairt", pairt);

    // const route = new Route([pairt], tokenIn, tokenOut);
    // console.log("pack route", route);

    // const inputAmount = parseUnits(
    //   fromTokenInputAmount,
    //   fromToken.decimals
    // ).toString();

    // const trade = new Trade(route, amount, TradeType.EXACT_INPUT);

    // console.log("Generated PancakeSwap Route:", trade);
    // return route;
  } catch (error) {
    console.error("Error generating PancakeSwap route:", error);
    return null;
  }
}
