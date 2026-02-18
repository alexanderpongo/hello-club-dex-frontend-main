import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    username: string;
    country: string;
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
    token: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    user: User;
  }
}