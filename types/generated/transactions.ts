export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  from: string;
  contractAddress: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  transactionIndex: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  input: string;
  confirmations: string;
  type: string;
  amount: string;
  time: string;
  total: string;
  price: string;
  wallet: string;
  transaction_hash: string;
  chainId: number;
}

export interface ApiResponse {
  status: string;
  message: string;
  result: Transaction[];
  cursor: string | null;
  page: number;
  page_size: number;
}
