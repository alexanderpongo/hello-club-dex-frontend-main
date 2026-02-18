import { ApiResponse, Transaction } from "@/types/generated/transactions";
import axios from "axios";
import { formatUnits } from "viem";
import { formatDistanceToNow } from "date-fns";

interface MoralisTransaction {
  from_address: string;
  to_address: string;
  value: string;
  token_decimals: string;
  block_timestamp: string;
  transaction_hash: string;
}

interface ProcessedTransaction extends MoralisTransaction {
  type: "BUY" | "SELL";
  amount: string;
  time: string;
  total: string;
  price: string;
  wallet: string;
}

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;
const MORALIS_API_URL = process.env.MORALIS_API_URL;

const chainIdToName: { [key: number]: string } = {
  1: "eth",
  56: "bsc",
  8453: "base",
  97: "bsc testnet",
};

export const getTransactions = async (
  tokenAddress: string,
  poolAddress: string,
  chainId: number,
  offset: number = 10,
  filter: "All" | "BUY" | "SELL" = "All",
  walletAddress?: string,
  cursor?: string,
  token0PriceInUSD?: number | null
): Promise<ApiResponse> => {
  try {
    const response = await axios.get(
      `${MORALIS_API_URL}/${poolAddress}/erc20/transfers`,
      {
        headers: {
          "X-API-Key": MORALIS_API_KEY,
        },
        params: {
          chain: chainIdToName[chainId],
          contract_addresses: [tokenAddress],
          limit: offset,
          order: "DESC",
          cursor: cursor,
        },
      }
    );

    let transactions = response.data.result;

    if (walletAddress) {
      transactions = transactions.filter(
        (tx: MoralisTransaction) =>
          tx.from_address.toLowerCase() === walletAddress.toLowerCase() ||
          tx.to_address.toLowerCase() === walletAddress.toLowerCase()
      );
    }

    const processedResult = transactions.map((tx: MoralisTransaction) => {
      const type =
        tx.from_address.toLowerCase() === poolAddress.toLowerCase()
          ? "SELL"
          : "BUY";
      const amount = parseFloat(
        formatUnits(BigInt(tx.value), Number(tx.token_decimals))
      ).toFixed(2);
      const time = formatDistanceToNow(new Date(tx.block_timestamp), {
        addSuffix: true,
      });
      const price = token0PriceInUSD
        ? `$${token0PriceInUSD.toFixed(2)}`
        : "N/A";
      const total =
        token0PriceInUSD && amount
          ? `$${(token0PriceInUSD * Number(amount)).toFixed(2)}`
          : "N/A";
      const wallet =
        tx.from_address.toLowerCase() === poolAddress.toLowerCase()
          ? tx.to_address
          : tx.from_address;

      return {
        ...tx,
        type,
        amount,
        time,
        total,
        price,
        wallet,
      };
    });

    const nonZeroResult = processedResult.filter(
      (tx: ProcessedTransaction) => parseFloat(tx.amount) !== 0
    );

    const filteredResult =
      filter === "All"
        ? nonZeroResult
        : nonZeroResult.filter(
            (tx: ProcessedTransaction) => tx.type === filter
          );

    return {
      ...response.data,
      result: filteredResult as Transaction[],
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw new Error("Failed to fetch transactions");
  }
};
