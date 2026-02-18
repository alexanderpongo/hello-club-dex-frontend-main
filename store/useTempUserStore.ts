import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface TempUser {
  twitter_handle?: string;
  discord_id?: string;
  telegram_id?: string;
}

interface TempUserStore {
  tempUser: TempUser;
  setTwitterHandle: (twitter_handle: string) => void;
  setDiscordId: (discord_id: string) => void;
  setTelegramId: (telegram_id: string) => void;
  clearStorage: () => void;
}

export const useTempUserStore = create<TempUserStore>()(
  persist(
    (set) => ({
      tempUser: {},

      setTwitterHandle: (twitter_handle: string) =>
        set((state) => ({ tempUser: { ...state.tempUser, twitter_handle } })),

      setDiscordId: (discord_id: string) =>
        set((state) => ({ tempUser: { ...state.tempUser, discord_id } })),

      setTelegramId: (telegram_id: string) =>
        set((state) => ({ tempUser: { ...state.tempUser, telegram_id } })),

      clearStorage: () => {
        set({ tempUser: {} });
      },
    }),
    {
      name: 'temp-user-storage', 
      storage: createJSONStorage(() => sessionStorage), 
    },
  )
);