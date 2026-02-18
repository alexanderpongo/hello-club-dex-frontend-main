"use client";

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useSearchParams } from 'next/navigation';
import { registerReferral } from '@/lib/actions/referrals.actions';


export function useReferralRegistration() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const [hasRegistered, setHasRegistered] = useState(false);

  // Store referral code from URL when page loads 
  useEffect(() => {
    
    let referralCode: string | null = null;
    
    // Method 1: useSearchParams 
    referralCode = searchParams?.get('ref') || null;
    
    // Method 2: Direct URL parsing 
    if (!referralCode && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      referralCode = urlParams.get('ref');
    }
    
    console.log('🔍 Referral detection:', {
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      searchParamsRef: searchParams?.get('ref'),
      windowRef: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('ref') : null,
      finalCode: referralCode,
      hasRegistered
    });
    
    if (referralCode && !hasRegistered) {
      localStorage.setItem('pendingReferralCode', referralCode);
      console.log('✅ Referral code stored in localStorage:', referralCode);
    } else if (!referralCode) {
      // Check if we already have one stored in local storage
      const stored = localStorage.getItem('pendingReferralCode');
      if (stored) {
        console.log('📋 Using previously stored referral code:', stored);
      } else {
        console.log('ℹ️ No referral code found in URL or localStorage');
      }
    }
  }, [searchParams, hasRegistered]);

  // Register referral when wallet is connected
  useEffect(() => {
    if (!isConnected || !address || hasRegistered) return;

    const registerRef = async () => {
      // Try to get referral code from URL first if not try localStorage
      const urlCode = searchParams?.get('ref');
      const storedCode = localStorage.getItem('pendingReferralCode');
      const referralCode = urlCode || storedCode;

      if (!referralCode) return;

      try {
        console.log('🔄 Registering referral...', { referralCode, address });
        
        const result = await registerReferral({
          referralCode,
          walletAddress: address,
        });

        if (result?.success) {
          console.log('✅ Referral registered successfully');
          // Clear the stored code after successful registration
          localStorage.removeItem('pendingReferralCode');
          setHasRegistered(true);
        } else {
          console.warn('⚠️ Referral registration returned non-success:', result?.message);
        }
      } catch (error) {
        console.error('❌ Failed to register referral:', error);
      }
    };

    registerRef();
  }, [address, isConnected, searchParams, hasRegistered]);

  return {
    hasRegistered,
    pendingReferralCode: typeof window !== 'undefined' 
      ? localStorage.getItem('pendingReferralCode') 
      : null,
  };
}
