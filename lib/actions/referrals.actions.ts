// "use server" - removed for static export

import axios from "axios";
import { Hex } from "viem";

export const generateReferralCode = async ({
    walletAddress,
}: {
    walletAddress: string,
}) => {
    try {
        const response = await axios.post(`${process.env.REFERRAL_BASE_URL}/api/referral/generate-code`,
            {
                walletAddress,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("generate Referral code Response:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.log("Error generating referral code:", error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.statusText ||
                error.message ||
                'Something went wrong',
        };
    }
}
export const generateClaimSignature = async ({
    walletAddress,
    tokenAddress,
    amount,
}: {
    walletAddress: string,
    tokenAddress: Hex,
    amount: string,

}) => {
    try {
        console.log("amount:", amount);
        const response = await axios.post(`${process.env.REFERRAL_BASE_URL}/api/referral/claim-signature`,
            {
                walletAddress,
                tokenAddress,
                amount,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_ADMIN_API_KEY
                },
            }
        )
        console.log("generate claim signature Response:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.log("Error generating claim signature:", error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.statusText ||
                error.message ||
                'Something went wrong',
        };
    }
}


export const getReferralStats = async ({
    walletAddress
}: {
    walletAddress: string
}) => {
    try {
        const response = await axios.get(`${process.env.REFERRAL_BASE_URL}/api/referral/stats/${walletAddress}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("Referral Stats Response:", response.data);
        console.log("Referral Stats fetched successfully", response.data.earnings);
        console.log("Referral Stats fetched successfully top", response.data.topReferrals);
        return response.data;
    } catch (error) {
        console.log("Error fetching referral stats:", error);
    }
}
export const getReferredUsers = async ({
    walletAddress,
    page = 1,
    limit = 5
}: {
    walletAddress: string,
    page?: number,
    limit?: number
}) => {
    try {
        const response = await axios.get(`${process.env.REFERRAL_BASE_URL}/api/referral/referred/${walletAddress}?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("Referred Users Response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Error fetching referred users:", error);
        return {
            success: false,
            referredUsers: [],
            totalReferrals: 0
        };
    }
}
export const getUserEarnings = async ({
    walletAddress
}: {
    walletAddress: string
}) => {
    try {
        const response = await axios.get(`${process.env.REFERRAL_BASE_URL}/api/referral/earnings/${walletAddress}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("User Earnings Response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Error fetching user earnings:", error);
        return { earningsByToken: {} };
    }
}

export const registerReferral = async ({
    walletAddress,
    referralCode
}: {
    walletAddress: string,
    referralCode: string
}) => {
    try {
        const response = await axios.post(`${process.env.REFERRAL_BASE_URL}/api/referral/register`,
            {
                walletAddress,
                referralCode
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("Register Referral Response:", response.data);
        console.log("Referral registered successfully", response.data.totalEarnings);

        return { success: true, data: response.data };
    } catch (error: any) {
        console.log("Error registering referral:", error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.statusText ||
                error.message ||
                'Something went wrong',
        };
    }
}
export const getTokenDetails = async ({
    tokenAddress
}: {
    tokenAddress: string
}) => {
    try {
        const response = await axios.get(`${process.env.REFERRAL_BASE_URL}/api/distributor/tokens/${tokenAddress}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("Token details Response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Error fetching token details:", error);
        return { token: {} };
    }
}
export const tokenSwap = async ({
    tokenAddress,
}: {
    tokenAddress: string,
}) => {
    try {
        const response = await axios.post(`${process.env.REFERRAL_BASE_URL}/api/distributor/swap/${tokenAddress}`,
            {
                tokenAddress,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("token swap Response:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.log("Error generating referral code:", error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.statusText ||
                error.message ||
                'Something went wrong',
        };
    }
}
export const swapAllTokens = async () => {
    try {
        const response = await axios.post(`${process.env.REFERRAL_BASE_URL}/api/distributor/swap-all`,
            {
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("token swap Response:", response.data);
        return { success: true, data: response.data };
    } catch (error: any) {
        console.log("Error generating referral code:", error);
        return {
            success: false,
            message:
                error.response?.data?.error ||
                error.response?.statusText ||
                error.message ||
                'Something went wrong',
        };
    }
}
export const getClaimHistory = async ({
    walletAddress,
    page = 1,
    limit = 5
}: {
    walletAddress: string,
    page?: number,
    limit?: number
}) => {
    try {
        const response = await axios.get(`${process.env.REFERRAL_BASE_URL}/api/referral/claims/${walletAddress}?page=${page}&limit=${limit}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.REFERRAL_API_KEY
                },
            }
        )
        console.log("Claim History Response:", response.data);
        return response.data;
    } catch (error) {
        console.log("Error fetching claim history:", error);
        return {
            success: false,
            walletAddress,
            totalClaims: 0,
            totalClaimedUSD: "0.00",
            claimsByToken: {}
        };
    }
}


