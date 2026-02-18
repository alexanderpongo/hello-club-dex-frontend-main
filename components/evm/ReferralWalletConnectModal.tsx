"use client";

import { useEffect, useState, Suspense } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";

function ReferralWalletConnectModalInternal() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const searchParams = useSearchParams();
  
  const [isOpen, setIsOpen] = useState(false);



  // Check if there's a referral code in the URL
  const hasReferralCode = () => {
    const refParam = searchParams.get("ref");
    return refParam && refParam.trim().length > 0;
  };

  // Show modal if user has referral code and is not connected
  useEffect(() => {
    const refCode = hasReferralCode();

    
    // Show modal if:
    // - There's a referral code in URL
    // - Wallet is not connected
    if (refCode && !isConnected) {
      // Small delay 
      const timer = setTimeout(() => {
        console.log('✅ Opening referral wallet connect modal');
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, searchParams]);

  // Auto-close when wallet is connected
  useEffect(() => {
    if (isConnected && isOpen) {
      setIsOpen(false);
    }
  }, [isConnected, isOpen]);

  const handleConnectWallet = () => {
    if (openConnectModal) {
      openConnectModal();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Don't render if no referral code
  if (!hasReferralCode()) {
    return null;
  }

  // Don't render if already connected
  if (isConnected) {
    return null;
  }


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full bg-white dark:bg-dark max-w-md overflow-hidden border !border-white/10 dark:!border-white/10 p-0">
        <div className="w-full dark:bg-[#1A1A1A] bg-white flex flex-col">
          <div className="p-8 flex flex-col items-center justify-center space-y-6">
        
            <div className="w-20 h-20 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-formula text-center text-black dark:text-white uppercase tracking-wider">
              Referral Detected
            </h2>

            {/* Description */}
            <p className="dark:text-gray-400 text-gray-600 text-center text-sm leading-relaxed">
              Connect your wallet to register this referral and start earning rewards together!
            </p>

            {/* Connect Wallet Button */}
            <Button
              onClick={handleConnectWallet}
              className="w-full button-primary uppercase !rounded-full !text-[14px] !font-bold !font-lato !leading-[20px] h-11"
            >
              Connect Wallet
            </Button>

            {/* Skip button */}
            <button
              onClick={handleClose}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReferralWalletConnectModal() {
  return (
    <Suspense fallback={null}>
      <ReferralWalletConnectModalInternal />
    </Suspense>
  );
}
