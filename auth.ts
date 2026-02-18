// import NextAuth from 'next-auth';
// import Credentials from 'next-auth/providers/credentials';
// import { login } from './lib/actions/auth.actions';

// export const { handlers, signIn, signOut, auth } = NextAuth({
//   providers: [
//     Credentials({
//       credentials: {
//         email: {},
//         otp: {},
//       },
//       authorize: async (credentials) => {
//         try {
//           const { data } = await login({
//             email: credentials?.email as string,
//             otp: Number(credentials?.otp),
//           });

//           if (!data || !data.token) {
//             return null;
//           }

//           // Return user object with their profile data
//           return {
//             id: data.user.id,
//             email: data.user.email,
//             firstname: data.user.firstname,
//             lastname: data.user.lastname,
//             username: data.user.username,
//             country: data.user.country,
//             twitter_handle: data.user.twitter_handle,
//             discord_id: data.user.discord_id,
//             telegram_id: data.user.telegram_id,
//             evm_address: data.user.evm_address,
//             svm_address: data.user.svm_address,
//             credits: data.user.credits,
//             balance: data.user.balance,
//             status: data.user.status,
//             role: data.user.role,
//             platforms: data.user.platforms,
//             token: data.token,
//           };
//         } catch (error: any) {
//           return null;
//         }
//       },
//     }),
//   ],
//   pages: {
//     signIn: '/',
//     error: '/',
//   },
//   callbacks: {
//     async session({ session, token, user }) {
//       session.user = token.user as any;
//       return session;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.user = user;
//       }
//       return token;
//     },
//     authorized: async ({ auth }) => {
//       return !!auth;
//     },
//   },
// });
