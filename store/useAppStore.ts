import { create } from 'zustand';

interface AppStore {
  isHelloTokenMetadataLoading: boolean;
  helloTokenAddress: string; // hello token address from contract
  helloTokenDecimals: number; // hello token decimals from contract
  isHelloBalanceLoading: boolean;
  helloBalance: number; // user wallet hello balance
  isStakeInfoLoading: boolean;
  stakedAmount: number; // user staked amount
  lockEndTime: string; // user lock end time
  nftTokenId: string; // user nft token id
  isNintyDays: boolean; // is user lock period 90 days
  pendingRewardAmount: number; // user pending reward amount
  isTotalLockedHelloAmountLoading: boolean;
  totalLockedHelloAmount: number; // total locked hello amount from contract
  unlockPenalty: number; // unlock penalty for early unlocks
  isUnlockPenaltyLoading: boolean;
  tierApr: number[];
  isTierAprLoading: boolean;
  helloPriceInUsd: number;
  isHelloPriceInUsdLoading: boolean;
  totalUniqueHolders: number;
  isTotalUniqueHoldersLoading: boolean;
  stakeFee: number;
  isStakeFeeLoading: boolean;
  isAdmin: boolean;
  tierTotalStakedAmount: number[];
  isTierTotalStakedAmountLoading: boolean;
  setIsHelloTokenMetadataLoading: (
    isHelloTokenMetadataLoading: boolean
  ) => void;
  setHelloTokenAddress: (helloTokenAddress: string) => void;
  setHelloTokenDecimals: (helloTokenDecimals: number) => void;
  setIsHelloBalanceLoading: (isHelloBalanceLoading: boolean) => void;
  setHelloBalance: (helloBalance: number) => void;
  setIsStakeInfoLoading: (isStakeInfoLoading: boolean) => void;
  setStakedAmount: (stakedAmount: number) => void;
  setLockEndTime: (lockEndTime: string) => void;
  setNftTokenId: (nftTokenId: string) => void;
  setIsNintyDays: (isNintyDays: boolean) => void;
  setPendingRewardAmount: (pendingRewardAmount: number) => void;
  setIsTotalLockedHelloAmountLoading: (
    isTotalLockedHelloAmountLoading: boolean
  ) => void;
  setTotalLockedHelloAmount: (totalLockedHelloAmount: number) => void;
  setUnlockPenalty: (unlockPenalty: number) => void;
  setIsUnlockPenaltyLoading: (isUnlockPenaltyLoading: boolean) => void;
  setTierApr: (tierApr: number[]) => void;
  setIsTierAprLoading: (isTierAprLoading: boolean) => void;
  setHelloPriceInUsd: (helloPriceInUsd: number) => void;
  setIsHelloPriceInUsdLoading: (isHelloPriceInUsdLoading: boolean) => void;
  setTotalUniqueHolders: (totalUniqueHolders: number) => void;
  setIsTotalUniqueHoldersLoading: (
    isTotalUniqueHoldersLoading: boolean
  ) => void;
  setStakeFee: (stakeFee: number) => void;
  setIsStakeFeeLoading: (isStakeFeeLoading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setTierTotalStakedAmount: (tierTotalStakedAmount: number[]) => void;
  setIsTierTotalStakedAmountLoading: (
    isTierTotalStakedAmountLoading: boolean
  ) => void;
}

export const useAppStore = create<AppStore>()((set) => ({
  isHelloTokenMetadataLoading: false,
  helloTokenAddress: '',
  helloTokenDecimals: 0,
  isHelloBalanceLoading: false,
  helloBalance: 0,
  isStakeInfoLoading: false,
  stakedAmount: 0,
  lockEndTime: '',
  nftTokenId: '',
  isNintyDays: false,
  pendingRewardAmount: 0,
  isTotalLockedHelloAmountLoading: false,
  totalLockedHelloAmount: 0,
  unlockPenalty: 0,
  isUnlockPenaltyLoading: false,
  tierApr: [0, 0, 0, 0, 0],
  isTierAprLoading: false,
  helloPriceInUsd: 0,
  isHelloPriceInUsdLoading: false,
  totalUniqueHolders: 0,
  isTotalUniqueHoldersLoading: false,
  stakeFee: 0,
  isStakeFeeLoading: false,
  isAdmin: false,
  tierTotalStakedAmount: [0, 0, 0, 0, 0],
  isTierTotalStakedAmountLoading: false,
  setIsHelloTokenMetadataLoading: (isHelloTokenMetadataLoading: boolean) =>
    set({ isHelloTokenMetadataLoading }),
  setHelloTokenAddress: (helloTokenAddress: string) =>
    set({ helloTokenAddress }),
  setHelloTokenDecimals: (helloTokenDecimals: number) =>
    set({ helloTokenDecimals }),
  setIsHelloBalanceLoading: (isHelloBalanceLoading: boolean) =>
    set({ isHelloBalanceLoading }),
  setHelloBalance: (helloBalance: number) => set({ helloBalance }),
  setIsStakeInfoLoading: (isStakeInfoLoading: boolean) =>
    set({ isStakeInfoLoading }),
  setStakedAmount: (stakedAmount: number) => set({ stakedAmount }),
  setLockEndTime: (lockEndTime: string) => set({ lockEndTime }),
  setNftTokenId: (nftTokenId: string) => set({ nftTokenId }),
  setIsNintyDays: (isNintyDays: boolean) => set({ isNintyDays }),
  setPendingRewardAmount: (pendingRewardAmount: number) =>
    set({ pendingRewardAmount }),
  setIsTotalLockedHelloAmountLoading: (
    isTotalLockedHelloAmountLoading: boolean
  ) => set({ isTotalLockedHelloAmountLoading }),
  setTotalLockedHelloAmount: (totalLockedHelloAmount: number) =>
    set({ totalLockedHelloAmount }),
  setUnlockPenalty: (unlockPenalty: number) => set({ unlockPenalty }),
  setIsUnlockPenaltyLoading: (isUnlockPenaltyLoading: boolean) =>
    set({ isUnlockPenaltyLoading }),
  setTierApr: (tierApr: number[]) => set({ tierApr }),
  setIsTierAprLoading: (isTierAprLoading: boolean) => set({ isTierAprLoading }),
  setHelloPriceInUsd: (helloPriceInUsd: number) => set({ helloPriceInUsd }),
  setIsHelloPriceInUsdLoading: (isHelloPriceInUsdLoading: boolean) =>
    set({ isHelloPriceInUsdLoading }),
  setTotalUniqueHolders: (totalUniqueHolders: number) =>
    set({ totalUniqueHolders }),
  setIsTotalUniqueHoldersLoading: (isTotalUniqueHoldersLoading: boolean) =>
    set({ isTotalUniqueHoldersLoading }),
  setStakeFee: (stakeFee: number) => set({ stakeFee }),
  setIsStakeFeeLoading: (isStakeFeeLoading: boolean) =>
    set({ isStakeFeeLoading }),
  setIsAdmin: (isAdmin: boolean) => set({ isAdmin }),
  setTierTotalStakedAmount: (tierTotalStakedAmount: number[]) =>
    set({ tierTotalStakedAmount }),
  setIsTierTotalStakedAmountLoading: (
    isTierTotalStakedAmountLoading: boolean
  ) => set({ isTierTotalStakedAmountLoading }),
}));
