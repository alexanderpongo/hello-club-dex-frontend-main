import { defineChain } from 'viem'

export const localChain = defineChain({
  id: 1337,
  name: 'LocalChainETH',
  nativeCurrency: { name: 'TestEther', symbol: 'TETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  }
})