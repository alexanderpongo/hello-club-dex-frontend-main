import { create } from 'zustand';

interface NavBarState {
  isSideNavBarOpen: boolean;
  openSideNavBar: () => void;
  closeSideNavBar: () => void;
}

export const useNavBarStore = create<NavBarState>()((set) => ({
  isSideNavBarOpen: false,
  openSideNavBar: () => set({ isSideNavBarOpen: true }),
  closeSideNavBar: () => set({ isSideNavBarOpen: false }),
}));
