'use client';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { WidgetSkeleton } from '@lifi/widget';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { useState } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { cn } from '@/lib/utils';

const DynamicImport = dynamic(() => import('@/components/LifiWidget'), {
  loading: () => <WidgetSkeleton />,
  ssr: false,
});

export const OnRamp = ({className, label = 'Buy $HELLO'}: {className?: string, label?: string}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { openConnectModal } = useConnectModal();
  const { address } = useAccount();

  const handleOpenConnectModal = () => {
    if (openConnectModal) openConnectModal();
    setIsOpen(true);
  };

  return (
    <>
      {!address ? (
        <Button
          className={cn("button-primary uppercase !rounded-full !text-[14px] !font-bold !font-lato !leading-[20px]", className)}
          onClick={() => handleOpenConnectModal()}
        >
          {label}
        </Button>
      ) : (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <Button
            className={cn("button-primary uppercase !rounded-full !text-[14px] !font-bold !font-lato !leading-[20px]", className)}
            onClick={() => setIsOpen(true)}
          >
            {label}
          </Button>

          <DialogContent className="bg-transparent border-none p-0">
            <DialogTitle />
            <DynamicImport />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
