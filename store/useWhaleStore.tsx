import { create } from "zustand";

interface WhaleState {
  followers: Follower[];
  setFollowers: (followers: Follower[]) => void;
  whaleInfo: WhaleUser | null;
  isWhale: boolean;
  setIsWhale: (isWhale: boolean) => void;
  setWhaleInfo: (whaleInfo: WhaleUser | null) => void;
  isWhaleStatusUpdating: boolean;
  setIsWhaleStatusUpdating: (isWhale: boolean) => void;
}

export const useWhaleStore = create<WhaleState>()((set) => ({
  followers: [],
  isWhale: false,
  whaleInfo: null,
  isWhaleStatusUpdating: false,
  setFollowers: (followers) => set({ followers: followers }),
  setIsWhale: (isWhale) => set({ isWhale: isWhale }),
  setWhaleInfo: (whaleInfo) => set({ whaleInfo: whaleInfo }),
  setIsWhaleStatusUpdating: (isWhaleStatusUpdating) =>
    set({ isWhaleStatusUpdating: isWhaleStatusUpdating }),
}));
