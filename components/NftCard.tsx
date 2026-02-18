// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useAppStore } from '@/store';
// import { Card, CardContent } from './ui/card';
// import Image from 'next/image';
// import Spinner from './Spinner';
// import { getTierId } from '@/lib/utils';
// // import { TIER_METADATA } from '@/constants/TierMetadata';
// import { useAccount } from 'wagmi';
// import LockCtaNft from './LockCtaNft';

// const NftCard = () => {
//   const { address } = useAccount();
//   const { stakedAmount, nftTokenId, isStakeInfoLoading } = useAppStore();
//   const [currentTier, setCurrentTier] = useState<TierMetadata | null>(null);

//   useEffect(() => {
//     const tierId = getTierId(stakedAmount);

//     if (tierId !== null && tierId < TIER_METADATA.length) {
//       setCurrentTier(TIER_METADATA[tierId]);
//     } else {
//       setCurrentTier(null);
//     }
//   }, [stakedAmount, address]);

//   if (!stakedAmount || !currentTier) return <LockCtaNft />;

//   return (
//     <Card className="rounded-lg p-0 border-none ring-1 ring-white/20">
//       <Image
//         src={currentTier.nftImage}
//         alt="nft"
//         width={1000}
//         height={1000}
//         quality={100}
//         unoptimized
//         className="object-cover rounded-t-lg"
//       />
//       <CardContent className="!p-0">
//         <div className="bg-[#151515] p-3 rounded-b-lg">
//           <div className="title-regular-bold uppercase flex gap-1">
//             {isStakeInfoLoading ? <Spinner /> : currentTier?.name} Tier
//           </div>
//           <div className="flex gap-1 text-slate">
//             <p>NFT ID</p>
//             {isStakeInfoLoading ? (
//               <Spinner className="my-auto" />
//             ) : (
//               <p>{`#${nftTokenId}`}</p>
//             )}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default NftCard;
