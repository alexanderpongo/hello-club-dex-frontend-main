// 'use client';
// import React, { useEffect, useState } from 'react';
// import Image from 'next/image';
// import { Progress } from './ui/progress';
// import { useAppStore } from '@/store';
// import { cn, getTierId } from '@/lib/utils';
// import { TIER_METADATA } from '@/constants/TierMetadata';
// import { useAccount } from 'wagmi';
// import Spinner from './Spinner';
// import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// const LockTokensProgress = () => {
//   const { address } = useAccount();
//   const { isStakeInfoLoading, stakedAmount, tierApr, isTierAprLoading } =
//     useAppStore();
//   const [userTierId, setUserTierId] = useState<number | null>(null);

//   useEffect(() => {
//     const tierId = getTierId(stakedAmount);
//     setUserTierId(tierId);
//   }, [stakedAmount, address]);

//   /**
//    * Calculates the progress percentage towards the next tier based on the current staked amount.
//    * The percentage is calculated relative to the threshold difference between the current tier
//    * and the next tier.
//    *
//    * @param {number} tier - The current tier index for which the progress is being calculated.
//    * @returns {number} - The progress percentage formatted to two decimal places, capped at 100.
//    */

//   const getProgressValue = (tier: number) => {
//     const percentage =
//       ((stakedAmount - TIER_METADATA[tier].threshold) /
//         (TIER_METADATA[tier + 1].threshold - TIER_METADATA[tier].threshold)) *
//       100;
//     const percentageFormatted = parseFloat(percentage.toFixed(2));
//     if (percentageFormatted > 100) {
//       return 100;
//     }
//     return percentageFormatted;
//   };

//   return (
//     <ScrollArea className="w-full whitespace-nowrap">
//       <div className="flex gap-3">
//         {TIER_METADATA.map((tier, index) => {
//           return (
//             <React.Fragment key={tier.id}>
//               <div className="flex flex-col">
//                 <div className="w-[120px] xl:w-[150px] h-auto mx-auto">
//                   <Image
//                     src={tier.image}
//                     alt={tier.name}
//                     width={200}
//                     height={200}
//                     className="rounded-sm ring-1 ring-white/20 ring-offset"
//                     unoptimized
//                   />
//                 </div>

//                 <div>
//                   <p
//                     className={cn(
//                       'title-small-semi-bold uppercase mt-1 text-center text-nowrap',
//                       userTierId === tier.id
//                         ? 'text-primary shadow-primary-text'
//                         : ''
//                     )}
//                   >
//                     {`${userTierId === tier.id ? 'You Are ' : ''} ${tier.name}`}
//                   </p>
//                 </div>

//                 <div className="mt-1 flex justify-center divide-x divide-gray-600 font-barlow">
//                   <div className="pr-1">
//                     <p className="text-sm text-end text-slate">APR</p>
//                     <div className="text-sm text-end">
//                       {isTierAprLoading ? (
//                         <Spinner />
//                       ) : (
//                         <p>{`${tierApr[index].toLocaleString()}%`}</p>
//                       )}
//                     </div>
//                   </div>

//                   <div className="pl-1">
//                     <p className="text-sm text-start text-slate text-nowrap">
//                       $HELLO
//                     </p>
//                     <p className="text-sm text-start text-nowrap">
//                       {tier.threshold.toLocaleString()}
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {index !== TIER_METADATA.length - 1 && (
//                 <div className="w-full my-auto min-w-[50px]">
//                   <Progress
//                     value={getProgressValue(tier.id)}
//                     className="h-1 -mt-7"
//                     indeterminate={isStakeInfoLoading}
//                   />
//                 </div>
//               )}
//             </React.Fragment>
//           );
//         })}
//       </div>
//       <ScrollBar orientation="horizontal" />
//     </ScrollArea>
//   );
// };

// export default LockTokensProgress;
