// "use client";
// import { useState, useEffect, useCallback } from "react";
// import { Button } from "../ui/button";
// import {
//   useAccount,
//   useConfig,
//   usePublicClient,
//   useSendTransaction,
//   useWalletClient,
// } from "wagmi";
// import { getChainProvider } from "@/lib/v3Providers";
// import {
//   Address,
//   concatHex,
//   encodeAbiParameters,
//   encodeFunctionData,
//   erc20Abi,
//   formatUnits,
//   fromHex,
//   Hex,
//   parseAbiParameters,
//   parseEther,
//   parseGwei,
//   parseUnits,
//   toHex,
// } from "viem";
// import { useSwapStore } from "@/store/useDexStore";
// import { generateRoute } from "@/lib/routing2";
// import {
//   type SendTransactionParameters,
//   sendTransaction,
//   signTypedData,
//   waitForTransaction,
//   waitForTransactionReceipt,
//   writeContract,
// } from "@wagmi/core";
// import { contractConfig } from "@/config/blockchain.config";
// import { ContractConfigItemType, TokenType } from "@/interfaces/index.i";
// import { BigNumberish, Bytes, BytesLike, ethers } from "ethers";
// import { useConnectModal } from "@rainbow-me/rainbowkit";
// import { Loader2 } from "lucide-react";
// import { ToastAction } from "../ui/toast";
// import Link from "next/link";
// import { cn } from "@/lib/utils";
// import {
//   checkApproveAllowance,
//   fetchBalance,
// } from "@/service/blockchain.service";
// import { toast } from "react-toastify";
// import {
//   AllowanceProvider,
//   AllowanceTransfer,
//   MaxAllowanceTransferAmount,
//   PermitSingle,
// } from "@uniswap/permit2-sdk";
// // import { serializePermit } from "@uniswap/permit2-sdk";

// // import {
// //   computePoolAddress,
// //   Pool,
// //   Route as PancakeRoute,
// //   Trade,
// // } from "@pancakeswap/v3-sdk";
// // import {
// //   Native,
// //   ChainId,
// //   CurrencyAmount,
// //   TradeType,
// //   Percent,
// //   Currency,
// // } from "@pancakeswap/sdk";
// // import {
// //   SmartRouter,
// //   SmartRouterTrade,
// //   SMART_ROUTER_ADDRESSES,
// //   SwapRouter,
// //   V4Router,
// // } from "@pancakeswap/smart-router";
// import { Permit2Signature } from "@pancakeswap/universal-router-sdk";
// import { hexValue } from "ethers/lib/utils";

// function SwapButton() {
//   const { chainId, address } = useAccount();
//   const publicClient = usePublicClient();
//   const { data: signer } = useWalletClient();
//   const config = useConfig();
//   const { sendTransactionAsync } = useSendTransaction();

//   function getChainProvider(): any {
//     const chainContractConfig: ContractConfigItemType =
//       contractConfig[chainId!] || contractConfig["default"];

//     const provider = new ethers.providers.JsonRpcProvider(
//       chainContractConfig.publicClientApi!,
//       chainId
//     );

//     return provider;
//   }

//   const {
//     fromToken,
//     setFromToken,
//     toToken,
//     setToToken,
//     fromTokenInputAmount,
//     setFromTokenInputAmount,
//     toTokenInputAmount,
//     setToTokenInputAmount,
//     fromTokenBalance,
//     isLoadingApprove,
//     setIsLoadingApprove,
//     setFromTokenApprovedAmount,
//     fromTokenApprovedAmount,
//     setToTokenApprovedAmount,
//     toTokenApprovedAmount,
//     setIsLoadingSwap,
//     isLoadingSwap,
//     setFromTokenBalance,
//     setToTokenBalance,
//     feeTier,
//     setUpdateBalance,
//     slippage,
//   } = useSwapStore();

//   const { openConnectModal } = useConnectModal();

//   const [isLoadingFetchApprovedAmount, setIsLoadingFetchApprovedAmount] =
//     useState(false);
//   const [permit2Signature, setPermit2Signature] = useState<
//     Permit2Signature | undefined
//   >(undefined);

//   const clearTokenDetails = () => {
//     // setFromToken(fromToken);
//     // setFromTokenBalance("0.00");
//     setFromTokenInputAmount("0.0");
//     // setToToken(toToken);
//     setToTokenInputAmount("0.0");
//     // setToTokenBalance("0.00");
//     // setIsApprovedSuccess(false);
//   };

//   async function fetchGasEstimates() {
//     if (!chainId) {
//       throw new Error("Chain ID is required to fetch gas estimates.");
//     }

//     // Fetch the latest block and gas price
//     const block = await publicClient?.getBlock({ blockTag: "latest" });
//     const gasPrice = await publicClient?.getGasPrice();
//     // console.log("gasPrice & block", gasPrice, block, publicClient);

//     if (chainId === 1) {
//       // Ethereum Mainnet
//       const baseFeePerGas = block?.baseFeePerGas || BigInt(0);
//       const maxPriorityFeePerGas = parseUnits("1", 9);

//       // Calculate Max Fee
//       const maxFeePerGas = baseFeePerGas + maxPriorityFeePerGas;

//       return {
//         chain: "Ethereum",
//         baseFeePerGas: formatUnits(baseFeePerGas, 9),
//         maxPriorityFeePerGas: formatUnits(maxPriorityFeePerGas, 9),
//         maxFeePerGas: formatUnits(maxFeePerGas, 9),
//       };
//     } else if (chainId === 56) {
//       return {
//         chain: "Binance Smart Chain",
//         gasPrice: formatUnits(gasPrice!, 9), // Current gas price in gwei
//         maxPriorityFeePerGas: formatUnits(BigInt(0), 9), // No priority fee on BSC
//         maxFeePerGas: formatUnits(gasPrice!, 9), // Max fee is the gas price on BSC
//       };
//     } else if (chainId === 97) {
//       return {
//         chain: "Binance Testnet ",
//         gasPrice: formatUnits(gasPrice!, 9), // Current gas price in gwei
//         maxPriorityFeePerGas: formatUnits(BigInt(0), 9), // No priority fee on BSC
//         maxFeePerGas: formatUnits(gasPrice!, 9), // Max fee is the gas price on BSC
//       };
//     } else {
//       throw new Error(`Unsupported chain ID: ${chainId}`);
//     }
//   }

//   // const swapHandler = async () => {
//   //   setIsLoadingSwap(true);

//   //   try {
//   //     if (
//   //       !chainId ||
//   //       !address ||
//   //       !fromToken ||
//   //       !toToken ||
//   //       !fromTokenInputAmount
//   //     ) {
//   //       toast.error("Missing required input parameters.");
//   //       return;
//   //     }

//   //     const chainContractConfig: ContractConfigItemType =
//   //       contractConfig[chainId] || contractConfig["default"];

//   //     const gasFees = await fetchGasEstimates();

//   //     console.log("wish gasFees", gasFees);

//   //     console.log(
//   //       "wish chainContractConfig",
//   //       chainContractConfig.v3FactoryAddress
//   //     );

//   //     const token0 = fromToken?.address! as Address;
//   //     const token1 = toToken?.address! as Address;
//   //     const fee = feeTier;

//   //     const formattedTokenFrom = fromToken?.address!.startsWith("0x")
//   //       ? fromToken.address.substring(2)
//   //       : fromToken.address;
//   //     const formattedTokenTo = toToken?.address!.startsWith("0x")
//   //       ? toToken.address.substring(2)
//   //       : toToken.address;

//   //     const fees = toHex(fee!).substring(2);
//   //     // const fees1 = hexValue(3000);
//   //     // console.log("feesfees", fees);

//   //     const encodedPath = formattedTokenFrom + "000" + fees + formattedTokenTo;
//   //     // const testEncode = encodeAbiParameters(
//   //     //   parseAbiParameters("address, string, address"),
//   //     //   [token0, fees, token1]
//   //     // );

//   //     console.log("slippage", slippage);

//   //     const recipient = address;
//   //     // const tokenIn = token0;
//   //     // const tokenOut = token1;
//   //     const amountIn = parseEther(fromTokenInputAmount); // 1 token (18 decimals)
//   //     const amountOutMin = parseEther(
//   //       (parseFloat(toTokenInputAmount) * (1 - slippage!)).toString()
//   //     );

//   //     // console.log("encodedPath", encodedPath);

//   //     // console.log(
//   //     //   "recipient, amountIn, amountOutMin, path, fromSender",
//   //     //   recipient,
//   //     //   amountIn,
//   //     //   amountOutMin,
//   //     //   encodedPath,
//   //     //   true
//   //     // );

//   //     const abiCoder = new ethers.utils.AbiCoder();
//   //     const swapData = abiCoder.encode(
//   //       ["address", "uint256", "uint256", "bytes", "bool"],
//   //       [recipient, amountIn, amountOutMin, `0x${encodedPath}`, true]
//   //     );
//   //     // const encodedData = encodeAbiParameters(
//   //     //   parseAbiParameters("address, uint256, uint256, bytes, bool"),
//   //     //   [recipient, amountIn, amountOutMin, '0x'+encodedPath, true]
//   //     // );

//   //     // const encodedData1 = encodeAbiParameters(
//   //     //   parseAbiParameters("address, bytes, address, bytes"),
//   //     //   [token0, `0x${"500"}`, token1, encodedPath]
//   //     // );

//   //     console.log("encodedData", swapData);

//   //     const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

//   //     // sendTxResult = sendTransactionAsync({
//   //     //   account: address,
//   //     //   chainId,
//   //     //   to: chainContractConfig?.v3UniversalRouterAddress as Address,
//   //     //   data: "0x3593564c000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000067c973f90000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000010000000000000000000000000067f25d7d851b6287552818d5cb5ea006840a28310000000000000000000000000000000000000000000000008ac7230489e8000000000000000000000000000000000000000000000000000113f4a036822be09f00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002b0a23b4eb2233cced50a3001a189531e6b1debffa0001f440ced14ac82002de4652f99c8f5592b388d08a92000000000000000000000000000000000000000000",
//   //     //   gasPrice: parseUnits(gasFees.gasPrice!, 9), // Convert gasPrice from gwei to wei
//   //     //   value: parseEther("0.005"), // Convert ETH to wei
//   //     // });
//   //     // console.log("sendTxResult", sendTxResult);

//   //     const swapCall = encodeFunctionData({
//   //       abi: chainContractConfig.v3UniversalABI,
//   //       functionName: "execute",
//   //       args: ["0x00", [swapData], deadline],
//   //     });

//   //     const hash = await signer?.sendTransaction({
//   //       to: chainContractConfig?.v3UniversalRouterAddress as Address,
//   //       data: swapCall,
//   //       gasLimit: 500000,
//   //     });

//   //     console.log("swap Transaction sent:", hash);

//   //     // Execute transaction

//   //     // const hash1 = await writeContract(config, {
//   //     //   address: chainContractConfig?.v3UniversalRouterAddress as Address,
//   //     //   abi: UniversalRouterABI,
//   //     //   functionName: "execute",
//   //     //   // args: ["0x00", [encodedData], deadline],
//   //     //   args: [concatHex(["0x00"]), [encodedData], deadline],
//   //     //   value: parseEther("0.005"),
//   //     //   chainId: chainId,
//   //     // });

//   //     const transactionReceipt = await waitForTransaction(config, {
//   //       hash: hash!,
//   //     });
//   //     if (transactionReceipt.status === "success") {
//   //       // Show success notification
//   //       toast.success(
//   //         <div>
//   //           <p>
//   //             Successfully swapped {fromTokenInputAmount} {fromToken.symbol} to{" "}
//   //             {toTokenInputAmount} {toToken.symbol}.
//   //           </p>
//   //           <Link
//   //             href={`${chainContractConfig.explorerURL}/tx/${hash}`}
//   //             target="_blank"
//   //             rel="noreferrer"
//   //             className="text-slate text-sm underline"
//   //           >
//   //             View Transaction
//   //           </Link>
//   //         </div>,
//   //         {
//   //           toastId: "swap-success-toast",
//   //         }
//   //       );
//   //       clearTokenDetails();
//   //       setUpdateBalance(true);
//   //     }
//   //   } catch (error: any) {
//   //     console.error("SwapHandler Error:", error);
//   //     toast.error(error?.shortMessage, {
//   //       toastId: "swap-error-toast",
//   //     });
//   //   } finally {
//   //     setIsLoadingSwap(false);
//   //   }
//   // };

//   const PERMIT2_ADDRESS = "0x31c2F6fcFf4F8759b3Bd5Bf0e1084A055615c768";

//   const swapHandler = async () => {
//     setIsLoadingSwap(true);
//     const chainContractConfig: ContractConfigItemType =
//       contractConfig[chainId!] || contractConfig["default"];
//     function toDeadline(expiration: number): number {
//       return Math.floor((Date.now() + expiration) / 1000);
//     }

//     const permitSingle: PermitSingle = {
//       details: {
//         token: fromToken?.address as Address,
//         amount: MaxAllowanceTransferAmount,
//         // You may set your own deadline - we use 30 days.
//         expiration: toDeadline(/* 30 days= */ 1000 * 60 * 60 * 24 * 30),
//         nonce: 0,
//       },
//       spender: chainContractConfig.v3UniversalRouterAddress as Address,
//       // You may set your own deadline - we use 30 minutes.
//       sigDeadline: toDeadline(/* 30 minutes= */ 1000 * 60 * 60 * 30),
//     };

//     try {
//       if (
//         !chainId ||
//         !address ||
//         !fromToken ||
//         !toToken ||
//         !fromTokenInputAmount
//       ) {
//         toast.error("Missing required input parameters.");
//         return;
//       }

//       const gasFees = await fetchGasEstimates();

//       const token0 = fromToken.address as Address;
//       const token1 = toToken.address as Address;
//       const fee = feeTier;

//       const formattedTokenFrom = token0.startsWith("0x")
//         ? token0.slice(2)
//         : token0;
//       const formattedTokenTo = token1.startsWith("0x")
//         ? token1.slice(2)
//         : token1;
//       const fees = toHex(fee!).substring(2);

//       const encodedPath = formattedTokenFrom + "000" + fees + formattedTokenTo;

//       // console.log("encodedPath", encodedPath);

//       const recipient = address;
//       const amountIn = parseEther(fromTokenInputAmount); // Input amount
//       const amountOutMin = parseEther(
//         (parseFloat(toTokenInputAmount) * (1 - slippage!)).toString()
//       );

//       // const encodedPermit = AllowanceTransfer.encodePermit(permitSingle);
//       // const permitBytes = serializePermit(permitSingle);

//       const abiCoder = new ethers.utils.AbiCoder();
//       const swapData = abiCoder.encode(
//         ["address", "uint256", "uint256", "bytes", "bool"],
//         [recipient, amountIn, amountOutMin, `0x${encodedPath}`, true]
//       );

//       console.log("swapData", swapData);

//       const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

//       // const signature = await signTypedData(config, {
//       //   domain: {
//       //     name: 'Permit2',
//       //     chainId: chainId,
//       //     verifyingContract: PERMIT2_ADDRESS,
//       //   },
//       //   types: {
//       //     PermitSingle: [
//       //       { name: 'details', type: 'PermitDetails' },
//       //       { name: 'spender', type: 'address' },
//       //       { name: 'sigDeadline', type: 'uint256' },
//       //     ],
//       //     PermitDetails: [
//       //       { name: 'token', type: 'address' },
//       //       { name: 'amount', type: 'uint160' },
//       //       { name: 'expiration', type: 'uint48' },
//       //       { name: 'nonce', type: 'uint48' },
//       //     ],
//       //   },
//       //   message: permitSingle,
//       // });

//       // // 👇 Step 1: Generate Permit2 Signature
//       // const { signature, permit } = await getPermitSignature({
//       //   token: token0,
//       //   spender: chainContractConfig?.v3UniversalRouterAddress!,
//       //   signer,
//       //   amount: amountIn,
//       // });
//       const provider = new ethers.providers.JsonRpcProvider(
//         chainContractConfig.publicClientApi!,
//         chainId
//       );
//       const allowanceProvider = new AllowanceProvider(
//         provider,
//         PERMIT2_ADDRESS
//       );
//       // const {
//       //   amount,
//       //   expiration,
//       //   nonce,
//       // } = allowanceProvider.getAllowanceData(
//       //   address,
//       //   token0,
//       //   chainContractConfig.v3UniversalRouterAddress as Address
//       // );

//       // 👇 Step 2: Encode Permit2 Data
//       const { domain, types, values } = AllowanceTransfer.getPermitData(
//         permitSingle,
//         PERMIT2_ADDRESS,
//         chainId
//       );

//       console.log("domain", domain, "types", types, "values", values);
//       // let sig;

//       // We use an ethers signer to sign this data:
//       // try {
//       //   const signature = await provider
//       //     .getSigner()
//       //     ._signTypedData(domain, types, values);

//       //   console.log("signature", signature);
//       //   sig = signature;
//       // } catch (error) {
//       //   console.log("signature err", error);
//       // }

//       const domain2 = {
//         name: "Permit2",
//         chainId,
//         verifyingContract: PERMIT2_ADDRESS as Address,
//       };

//       type WagmiPermitSingle = {
//         details: {
//           token: string;
//           amount: bigint;
//           expiration: bigint;
//           nonce: bigint;
//         };
//         spender: string;
//         sigDeadline: bigint;
//       };

//       const message: WagmiPermitSingle = {
//         details: {
//           token: permitSingle.details.token,
//           amount: BigInt(permitSingle.details.amount.toString()),
//           expiration: BigInt(permitSingle.details.expiration.toString()),
//           nonce: BigInt(permitSingle.details.nonce.toString()),
//         },
//         spender: permitSingle.spender,
//         sigDeadline: BigInt(permitSingle.sigDeadline.toString()),
//       };
//       // const handleSign = async () => {
//       //   try {
//       const signature = await signTypedData(config, {
//         domain: domain2,
//         types,
//         primaryType: "PermitSingle",
//         message,
//         // value: values, // Note: it's called 'value' in wagmi, not 'values'
//         // primaryType: "YourPrimaryType", // replace with your primary type
//       });
//       console.log("Signature:", signature);

//       // const packedPermit = AllowanceTransfer.pack(permitSingle);

//       const permitData = abiCoder.encode(
//         [
//           "tuple(tuple(address token, uint160 amount, uint48 expiration, uint48 nonce) details, address spender, uint256 sigDeadline)",
//           "bytes",
//         ],
//         [permitSingle, signature]
//       );

//       // const permitData = abiCoder.encode(
//       //   ["bytes", "bytes"],
//       //   [permitSingle, signature]
//       // );
//       console.log("permitData", permitData);
//       //     // Do something with the signature
//       //   } catch (error) {
//       //     console.error("Signing failed:", error);
//       //   }
//       // };

//       // handleSign();
//       // const sigData = abiCoder.encode(["bytes"], [sig]);
//       // 👇 Step 3: Encode execute() call with permit + swap
//       const swapCall = encodeFunctionData({
//         abi: chainContractConfig.v3UniversalABI,
//         functionName: "execute",
//         args: ["0x0a00", [permitData, swapData], deadline],
//       });

//       // 👇 Step 4: Send the transaction
//       const hash = await signer?.sendTransaction({
//         to: chainContractConfig.v3UniversalRouterAddress as Address,
//         data: swapCall,
//         gasLimit: 500000,
//       });

//       const transactionReceipt = await waitForTransaction(config, {
//         hash: hash!,
//       });

//       if (transactionReceipt.status === "success") {
//         toast.success(
//           <div>
//             <p>
//               Successfully swapped {fromTokenInputAmount} {fromToken.symbol} to{" "}
//               {toTokenInputAmount} {toToken.symbol}.
//             </p>
//             <Link
//               href={`${chainContractConfig.explorerURL}/tx/${hash}`}
//               target="_blank"
//               rel="noreferrer"
//               className="text-slate text-sm underline"
//             >
//               View Transaction
//             </Link>
//           </div>,
//           {
//             toastId: "swap-success-toast",
//           }
//         );

//         clearTokenDetails();
//         setUpdateBalance(true);
//       }
//     } catch (error: any) {
//       console.error("SwapHandler Error:", error);
//       toast.error(
//         error?.shortMessage || "Something went wrong during the swap.",
//         {
//           toastId: "swap-error-toast",
//         }
//       );
//     } finally {
//       setIsLoadingSwap(false);
//     }
//   };

//   // Permit2 ABI
//   const PERMIT2_ABI = [
//     {
//       inputs: [
//         { internalType: "address", name: "token", type: "address" },
//         { internalType: "address", name: "spender", type: "address" },
//         { internalType: "uint160", name: "amount", type: "uint160" },
//         { internalType: "uint48", name: "expiration", type: "uint48" },
//       ],
//       name: "approve",
//       outputs: [],
//       stateMutability: "nonpayable",
//       type: "function",
//     },
//   ];

//   // const formattedAddress = address.startsWith("0x")
//   //   ? toToken.address.substring(2)
//   //   : toToken.address;
//   const approveToken = async () => {
//     const chainContractConfig: ContractConfigItemType =
//       contractConfig[chainId || "default"];
//     const permit2Contract = new ethers.Contract(PERMIT2_ADDRESS, PERMIT2_ABI);
//     const decimals = fromToken?.decimals;
//     const uint160Max = (BigInt(1) << BigInt(160)) - BigInt(1);

//     const maxApproval = ethers.utils.parseUnits(
//       uint160Max.toString(),
//       decimals
//     ); // Approve Permit2
//     const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

//     const hash = await writeContract(config, {
//       address: PERMIT2_ADDRESS as Address,
//       abi: PERMIT2_ABI,
//       functionName: "approve",
//       args: [
//         fromToken?.address! as Address,
//         chainContractConfig?.v3UniversalRouterAddress! as Address,
//         "1461501637330902918203684832716283019655932542975",
//         deadline,
//       ],
//       chainId: chainId,
//     });
//     // const tx1 = await tokenContract.approve(PERMIT2_ADDRESS, maxApproval);
//     const data = await waitForTransaction(config, {
//       hash: hash,
//     });

//     if (data.status === "success") {
//       alert("Approval successful");
//     }
//     // console.log();

//     // Approve Universal Router via Permit2
//     // try {
//     //   const hash2 = await writeContract(config, {
//     //     address: PERMIT2_ADDRESS as Address,
//     //     abi: PERMIT2_ABI,
//     //     functionName: "approve",
//     //     args: [
//     //       fromToken?.address! as Address,
//     //       chainContractConfig?.v3UniversalRouterAddress as Address,
//     //       maxApproval,
//     //       Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
//     //     ],
//     //     chainId: chainId,
//     //   });
//     //   const data2 = await waitForTransaction(config, {
//     //     hash: hash2,
//     //   });
//     //   if (data2.status === "success") {
//     //     alert("Approval successful");
//     //   }
//     // } catch (error) {
//     //   console.log("approve error", error);
//     // }
//   };

//   const handleApprove = async (token: TokenType, amount: string) => {
//     setIsLoadingApprove(true);
//     try {
//       let tokenAmountFormated =
//         amount.toString().split(".")[1]?.length > (token?.decimals ?? 18)
//           ? parseFloat(amount)
//               .toFixed(token?.decimals ?? 18)
//               .toString()
//           : amount.toString();
//       const chainContractConfig: ContractConfigItemType =
//         contractConfig[chainId || "default"];

//       const hash = await writeContract(config, {
//         address: token.address as Address,
//         abi: erc20Abi,
//         functionName: "approve",
//         args: [
//           chainContractConfig?.v3UniversalRouterAddress as Address,
//           parseUnits(tokenAmountFormated, token?.decimals),
//         ],
//         chainId: chainId,
//       });

//       const data = await waitForTransaction(config, {
//         hash: hash,
//       });

//       console.log("wish approve data", data);
//       if (data?.status == "success") {
//         // setIsApprovedSuccess(true);
//         toast.success(
//           <div>
//             <p>
//               Successfully approved {amount} {token?.symbol}
//             </p>
//             <Link
//               href={`${chainContractConfig?.explorerURL}/tx/${data?.transactionHash}`}
//               target="_blank"
//               rel="noreferrer"
//               className="text-slate text-sm underline"
//             >
//               See Transaction
//             </Link>
//           </div>,
//           {
//             toastId: "approve-swap-token",
//           }
//         );
//       }
//     } catch (error: any) {
//       console.log("Error while approving", error);
//       toast.error(error?.shortMessage, {
//         toastId: "approve-swap-token",
//       });
//     } finally {
//       setIsLoadingApprove(false);
//     }
//   };

//   const fetchFromTokenApprovedAmount = async () => {
//     if (fromToken) {
//       const fromTokenAllowance = await checkApproveAllowance(
//         address,
//         fromToken?.address as Address,
//         fromToken?.chainId,
//         setIsLoadingFetchApprovedAmount,
//         config
//       );
//       console.log("wish fromTokenAllowance", fromTokenAllowance);

//       setFromTokenApprovedAmount(
//         formatUnits(BigInt(fromTokenAllowance ?? "0"), fromToken?.decimals)
//       );
//     }
//   };

//   const fetchToTokenApprovedAmount = async () => {
//     if (toToken && toToken.address !== "native") {
//       const toTokenAllowance = await checkApproveAllowance(
//         address,
//         toToken?.address as Address,
//         toToken?.chainId,
//         setIsLoadingFetchApprovedAmount,
//         config
//       );

//       setToTokenApprovedAmount(
//         formatUnits(BigInt(toTokenAllowance ?? "0.0"), toToken?.decimals)
//       );
//     }
//   };

//   useEffect(() => {
//     if (fromToken) {
//       fetchFromTokenApprovedAmount();
//     }
//     console.log("wish fromTokenApprovedAmount", fromTokenApprovedAmount);
//   }, [fromToken, address, isLoadingApprove]);

//   useEffect(() => {
//     if (toToken) {
//       fetchToTokenApprovedAmount();
//     }
//     console.log("wish toTokenApprovedAmount", toTokenApprovedAmount);
//   }, [toToken, address, isLoadingApprove]);

//   return (
//     <div>
//       {" "}
//       {!address ? (
//         <Button
//           className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
//           onClick={openConnectModal}
//         >
//           Connect Wallet
//         </Button>
//       ) : fromToken && toToken && ![500, 2500, 10000].includes(feeTier!) ? (
//         <Button
//           className="w-full bg-transparent border-2 border-[#ffffff14] !font-semibold h-14 !text-lg"
//           disabled={true}
//         >
//           Insufficient liquidity for this trade.
//         </Button>
//       ) : parseFloat(fromTokenInputAmount) >
//           parseFloat(fromTokenApprovedAmount) &&
//         fromToken &&
//         fromToken.address != "native" ? (
//         // &&
//         // !isApprovedSuccess
//         <Button
//           className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
//           // onClick={() =>
//           //   handleApprove(fromToken, fromTokenInputAmount.toString())
//           // }
//           onClick={approveToken}
//           disabled={
//             isLoadingApprove ||
//             fromToken?.address == toToken?.address ||
//             parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
//           }
//         >
//           {isLoadingApprove && <Loader2 size={20} className="animate-spin" />}{" "}
//           {parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
//             ? "Insufficient funds"
//             : `Approve`}{" "}
//           ({fromToken?.symbol})
//         </Button>
//       ) : (
//         <>
//           <Button
//             className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
//             // onClick={() =>
//             //   handleApprove(fromToken, fromTokenInputAmount.toString())
//             // }
//             onClick={approveToken}
//             disabled={
//               isLoadingApprove ||
//               fromToken?.address == toToken?.address ||
//               parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
//             }
//           >
//             {isLoadingApprove && <Loader2 size={20} className="animate-spin" />}{" "}
//             {parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount)
//               ? "Insufficient funds"
//               : `Approve`}{" "}
//             ({fromToken?.symbol})
//           </Button>
//           <Button
//             onClick={swapHandler}
//             className="w-full button-primary !font-semibold uppercase h-14 !text-lg"
//             disabled={
//               fromToken?.address === toToken?.address ||
//               parseFloat(fromTokenBalance) <= parseFloat("0") ||
//               parseFloat(fromTokenInputAmount) <= parseFloat("0") ||
//               parseFloat(toTokenInputAmount) <= parseFloat("0") ||
//               parseFloat(fromTokenBalance) < parseFloat(fromTokenInputAmount) ||
//               isLoadingFetchApprovedAmount ||
//               isLoadingSwap
//             }
//           >
//             {isLoadingSwap && <Loader2 size={20} className="animate-spin" />}{" "}
//             Swap
//           </Button>
//         </>
//       )}
//     </div>
//   );
// }

// export default SwapButton;
