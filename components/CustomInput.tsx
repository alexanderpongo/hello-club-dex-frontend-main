'use client';
import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarImage } from './ui/avatar';
import Spinner from './Spinner';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';

const CustomInput = ({
  lockAmount,
  setLockAmount,
}: {
  lockAmount: string;
  setLockAmount: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const { helloBalance, isHelloBalanceLoading } = useAppStore();
  const [isValidInputAmount, setIsValidInputAmount] = useState<boolean>(true);

  useEffect(() => {
    if (Number(lockAmount) > helloBalance || Number(lockAmount) < 0) {
      setIsValidInputAmount(false);
    } else {
      setIsValidInputAmount(true);
    }
  }, [helloBalance, lockAmount]);

  return (
    <div
      className={cn(
        'flex bg-white bg-opacity-[0.08] ring-1 ring-white ring-opacity-[0.05] rounded-[15px] h-[52px] transition-all duration-300',
        isValidInputAmount
          ? 'ring-1 ring-white ring-opacity-[0.05]'
          : 'ring-1 ring-minus ring-opacity-100'
      )}
    >
      <div className="my-auto pl-2">
        <Avatar className="size-7">
          <AvatarImage src="/icons/hello.svg" alt="hello" />
        </Avatar>
      </div>
      <Input
        value={lockAmount}
        onChange={(e) => setLockAmount(e.target.value)}
        placeholder="Enter Amount"
        className="w-full border-none h-[52px] rounded-[15px] ring-1 ring-white ring-opacity-0"
        type="number"
        onWheel={(event) => event.currentTarget.blur()}
      />

      <div className="my-auto pr-2">
        <Button
          size="sm"
          className="button-primary"
          disabled={isHelloBalanceLoading}
          onClick={() => setLockAmount(helloBalance.toString())}
        >
          {isHelloBalanceLoading ? <Spinner /> : 'MAX'}
        </Button>
      </div>
    </div>
  );
};

export default CustomInput;
