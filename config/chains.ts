import { ChainType } from "@/interfaces/index.i";

export const chains: ChainType[] = [
  {
    id: 1,
    name: "ETHEREUM",
    image: "https://etherscan.io/images/svg/brands/ethereum-original.svg",
    // image: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",

    chainId: 1,
    endpointChainID: 101,
    sgAdapterAddress: "0xD408a20f1213286fB3158a2bfBf5bFfAca8bF269",
  },
  {
    id: 2,
    name: "BINANCE",
    // image: "/chain-icons/binance.svg",
    image: "https://etherscan.io/token/images/binancebnb_32.svg",
    chainId: 56,
    endpointChainID: 102,
    sgAdapterAddress: "0xFF51a7C624Eb866917102707F3dA8bFb99Db8692",
  },
  // {
  //   id: 3,
  //   name: "POLYGON",
  //   image: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
  //   chainId: 137,
  //   endpointChainID: 109,
  //   sgAdapterAddress: "0x1719DEf1BF8422a777f2442bcE704AC4Fb20c7f0",
  // },
  {
    id: 4,
    name: "BASE",
    // image: "https://avatars.githubusercontent.com/u/16627100?s=200&v=4",
    image: "/chain-icons/base-logo.png",
    chainId: 8453,
    endpointChainID: 184,
    sgAdapterAddress: "0xD408a20f1213286fB3158a2bfBf5bFfAca8bF269",
  },
  {
    id: 5,
    name: "BSC TESTNET",
    image: "/icons/bscTest.png",
    // image:
    //   "https://w7.pngwing.com/pngs/490/964/png-transparent-bnb-binance-coin-cryptocoin-exchange-coins-crypto-blockchain-cryptocurrency-logo-glyph-icon.png",
    chainId: 97,
    endpointChainID: null,
    sgAdapterAddress: "0x5fd7F334B3be96D79601Af95c3E0062Af34dF663",
  },
];

// import { ChainType } from "@/lib/types";
// import { Hex } from "viem";

// export const chains: ChainType[] = [
//   {
//     id: 1,
//     name: "ETHEREUM",
//     image: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
//     chainId: 1,
//     endpointChainID: 101,
//     sgAdapterAddress: process.env.NEXT_PUBLIC_ETH_ADAPTER_CONTRACT as Hex,
//   },
//   {
//     id: 2,
//     name: "BINANCE",
//     image: "https://cryptologos.cc/logos/bnb-bnb-logo.svg",
//     chainId: 56,
//     endpointChainID: 102,
//     sgAdapterAddress: process.env.NEXT_PUBLIC_BSC_ADAPTER_CONTRACT as Hex,
//   },
//   {
//     id: 3,
//     name: "POLYGON",
//     image: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
//     chainId: 137,
//     endpointChainID: 109,
//     sgAdapterAddress: process.env.NEXT_PUBLIC_POLYGON_ADAPTER_CONTRACT as Hex,
//   },
//   {
//     id: 4,
//     name: "BASE",
//     image: "https://avatars.githubusercontent.com/u/108554348?s=200&v=4",
//     chainId: 8453,
//     endpointChainID: 184,
//     sgAdapterAddress: process.env.NEXT_PUBLIC_BASE_ADAPTER_CONTRACT as Hex,
//   },
//   {
//     id: 5,
//     name: "BSC TESTNET",
//     image:
//       "https://w7.pngwing.com/pngs/490/964/png-transparent-bnb-binance-coin-cryptocoin-exchange-coins-crypto-blockchain-cryptocurrency-logo-glyph-icon.png",
//     chainId: 97,
//     endpointChainID: null,
//     sgAdapterAddress: "0x5fd7F334B3be96D79601Af95c3E0062Af34dF663",
//   },
// ];
