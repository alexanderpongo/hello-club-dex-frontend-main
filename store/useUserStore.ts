import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  username?: string;
  country?: string;
  pfp?: string;
  twitter_handle?: string;
  discord_id?: string;
  telegram_id?: string;
  evm_address?: string;
  svm_address?: string;
  credits: number;
  balance: number;
  status: string;
  role: string;
  platforms: string[];
}

interface UserStore {
  userProfileDetails: User;
  isUserProfileDetailsLoading: boolean;
  setIsUserProfileDetailsLoading: (
    isUserProfileDetailsLoading: boolean
  ) => void;
  setUserProfileDetails: (userProfileDetails: User) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  userProfileDetails: {
    id: '',
    email: '',
    credits: 0,
    balance: 0,
    status: '',
    role: '',
    platforms: [],
  },
  isUserProfileDetailsLoading: false,
  setIsUserProfileDetailsLoading: (isUserProfileDetailsLoading: boolean) =>
    set({ isUserProfileDetailsLoading }),
  setUserProfileDetails: (userProfileDetails: User) =>
    set({ userProfileDetails }),
}));
