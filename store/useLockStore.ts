import { create } from "zustand";

interface LockState {
  wallet: string | null;
  setWalet: (wallet: string | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  blockchain: string | null;
  setBlockchain: (blockchain: string | null) => void;
  selectedDex: string;
  setSelectedDex: (dex: string) => void;
  tokenIdInput: string;
  setTokenIdInput: (id: string) => void;
  debounceTokenIdInput: string;
  setDebounceTokenIdInput: (id: string) => void;
  ownerOfTokenId: string;
  setOwnerOfTokenId: (owner: string) => void;
  isLoadingOwner: boolean;
  setIsLoadingOwner: (isLoading: boolean) => void;
  selectedToken: string;
  setSelectedToken: (token: string) => void;
  lpToken: string | null;
  setLpToken: (lpToken: string | null) => void;
  lockAmount: string | null;
  setLockAmount: (lockAmount: string | null) => void;
  unlockDate: string | null;
  setUnlockDate: (unlockDate: string | null) => void;
  isValidReferral: boolean;
  setIsValidReferral: (isValidReferral: boolean) => void;
  referralCode: string | null;
  setReferralCode: (referralCode: string | null) => void;
  date: Date | null;
  setDate: (date: Date | null) => void;
  serviceFee: string | null;
  setServiceFee: (serviceFee: string | null) => void;
  isLoadingServiceFee: boolean;
  setIsLoadingServiceFee: (isLoading: boolean) => void;
  txHash: string;
  setTxHash: (tx: string) => void;
  lockId: string;
  setLockId: (id: string) => void;
}

export const useLockStore = create<LockState>()((set) => ({
  wallet: null,
  setWalet: (wallet: string | null) => set({ wallet: wallet }),
  activeTab:
    process.env.NEXT_PUBLIC_ENABLE_TESTNETS == "true" ? "testnet" : "mainnet",
  setActiveTab: (tab: string) => set({ activeTab: tab }),
  blockchain: "",
  setBlockchain: (blockchain: string | null) => set({ blockchain: blockchain }),
  selectedDex: "1",
  setSelectedDex: (dex: string) => set({ selectedDex: dex }),
  tokenIdInput: "",
  setTokenIdInput: (id: string) => set({ tokenIdInput: id }),
  debounceTokenIdInput: "",
  setDebounceTokenIdInput: (id: string) => set({ debounceTokenIdInput: id }),
  ownerOfTokenId: "",
  setOwnerOfTokenId: (owner: string) => set({ ownerOfTokenId: owner }),
  isLoadingOwner: false,
  setIsLoadingOwner: (isLoading: boolean) => set({ isLoadingOwner: isLoading }),
  selectedToken: "",
  setSelectedToken: (token: string) => set({ selectedToken: token }),
  lpToken: null,
  setLpToken: (lpToken: string | null) => set({ lpToken: lpToken }),
  lockAmount: "1",
  setLockAmount: (lockAmount: string | null) => set({ lockAmount: lockAmount }),
  unlockDate: null,
  setUnlockDate: (unlockDate: string | null) => set({ unlockDate: unlockDate }),
  isValidReferral: false,
  setIsValidReferral: (isValidReferral: boolean) =>
    set({ isValidReferral: isValidReferral }),
  referralCode: null,
  setReferralCode: (referralCode: string | null) =>
    set({ referralCode: referralCode }),
  date: (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })(),
  setDate: (date: Date | null) => set({ date: date }),
  serviceFee: "150.00",
  setServiceFee: (serviceFee: string | null) => set({ serviceFee: serviceFee }),
  isLoadingServiceFee: false,
  setIsLoadingServiceFee: (isLoading: boolean) =>
    set({ isLoadingServiceFee: isLoading }),
  txHash: "",
  setTxHash: (tx: string) => set({ txHash: tx }),
  lockId: "",
  setLockId: (id: string) => set({ lockId: id }),
}));
