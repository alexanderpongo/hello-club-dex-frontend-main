import { contractConfig } from "@/config/blockchain.config";
import {
  ContractConfigItemType,
  TokenType,
  TradeTokenType,
} from "@/interfaces/index.i";
import { getBalance, readContract } from "@wagmi/core";
import { Address, erc20Abi, formatUnits } from "viem";

export const fetchBalance = async (
  config: any,
  chainId: number | undefined,
  address: Address,
  token: TokenType | null,
  tokenAddress?: Address
) => {
  const balance = await readContract(config, {
    address: tokenAddress ?? (token?.address as Address),
    abi: erc20Abi,
    functionName: "balanceOf",
    chainId: chainId,
    args: [address],
  });

  return formatUnits(balance, token?.decimals ?? 18).toString();
};

export const tradeFetchBalance = async (
  config: any,
  chainId: number | undefined,
  address: Address,
  token: TradeTokenType | null,
  tokenAddress?: Address
) => {
  console.log("token?.address", token?.address);

  const balance = await readContract(config, {
    address: tokenAddress ?? (token?.address as Address),
    abi: erc20Abi,
    functionName: "balanceOf",
    chainId: chainId,
    args: [address],
  });

  return formatUnits(balance, token?.decimal ?? 18).toString();
};

export const checkApproveAllowance = async (
  connectedWallet: Address | undefined,
  tokenAddress: Address,
  chainId: number,
  setIsLoadingGetAllowance: React.Dispatch<React.SetStateAction<boolean>>,
  config: any
) => {
  setIsLoadingGetAllowance(true);
  try {
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId || "default"];
    const spenderAddress = chainContractConfig.v3RouterAddress as Address;
    // const spenderAddress =
    //   "0xd77C2afeBf3dC665af07588BF798bd938968c72E" as Address;
    const approvedAmount = await readContract(config, {
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "allowance",
      chainId: chainId,
      args: [connectedWallet as Address, spenderAddress],
    });

    return approvedAmount.toString();
  } catch (error) {
    console.error("Error while checking approve allowance", error);
  } finally {
    setIsLoadingGetAllowance(false);
  }
};

export const checkAggregatorApproveAllowance = async (
  connectedWallet: Address | undefined,
  tokenAddress: Address,
  chainId: number,
  setIsLoadingGetAllowance: React.Dispatch<React.SetStateAction<boolean>>,
  config: any,
  aggregatorAddress: Address | undefined
) => {
  setIsLoadingGetAllowance(true);
  try {
    const spenderAddress = aggregatorAddress as Address;
    const approvedAmount = await readContract(config, {
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "allowance",
      chainId: chainId,
      args: [connectedWallet as Address, spenderAddress],
    });

    return approvedAmount.toString();
  } catch (error) {
    console.error("Error while checking approve allowance", error);
  } finally {
    setIsLoadingGetAllowance(false);
  }
};

export const checkLpApproveAllowance = async (
  connectedWallet: Address | undefined,
  tokenAddress: Address,
  chainId: number,
  setIsLoadingGetAllowance: React.Dispatch<React.SetStateAction<boolean>>,
  config: any
) => {
  setIsLoadingGetAllowance(true);
  try {
    const chainContractConfig: ContractConfigItemType =
      contractConfig[chainId || "default"];
    const spenderAddress =
      chainContractConfig.v3PositionManagerAddress as Address;
    const approvedAmount = await readContract(config, {
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "allowance",
      chainId: chainId,
      args: [connectedWallet as Address, spenderAddress],
    });

    return approvedAmount.toString();
  } catch (error) {
    console.error("Error while checking approve allowance", error);
  } finally {
    setIsLoadingGetAllowance(false);
  }
};

export const fetchTokenName = async (
  config: any,
  chainId: number | undefined,
  tokenAddress: string
) => {
  try {
    const name = await readContract(config, {
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "name",
      chainId: chainId,
      args: [],
    });

    return name;
  } catch (e: any) {
    console.error("Error while fetching token name : ", e);
  }
};

export const fetchTokenSymbol = async (
  config: any,
  chainId: number | undefined,
  tokenAddress: string
) => {
  try {
    const symbol = await readContract(config, {
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "symbol",
      chainId: chainId,
      args: [],
    });

    return symbol;
  } catch (e: any) {
    console.error("Error while fetching token symbol : ", e);
  }
};

export const fetchTokenDecimals = async (
  config: any,
  chainId: number | undefined,
  tokenAddress: string
) => {
  try {
    const decimals = await readContract(config, {
      address: tokenAddress as Address,
      abi: erc20Abi,
      functionName: "decimals",
      chainId: chainId,
      args: [],
    });

    return decimals;
  } catch (e: any) {
    console.error("Error while fetching token decimals : ", e);
  }
};

export async function getWalletTokens(
  config: any,
  address: Address,
  tokens: TokenType[]
): Promise<TokenType[]> {
  const walletTokens: TokenType[] = [];

  for (const token of tokens) {
    try {
      const balance = await readContract(config, {
        address: token.address as Address,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      });
      if (BigInt(balance) > BigInt(0)) {
        walletTokens.push(token);
      }
    } catch (e) {
      console.warn(`Error fetching balance for ${token.symbol}`, e);
    }
  }

  return walletTokens;
}
