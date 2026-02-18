import React from 'react';
import { Avatar, AvatarImage } from './ui/avatar';

const BalanceOnChain = ({
  chain,
  balance,
}: {
  chain: string;
  balance: string;
}) => {
  const getChainIcon = (chain: string) => {
    switch (chain) {
      case 'Ethereum':
        return '/icons/eth.svg';
      case 'BSC':
        return '/icons/bnb.svg';
      case 'Solana':
        return '/icons/solana.svg';
    }
  };

  return (
    <div className="flex gap-3">
      <div className="my-auto">
        <Avatar className="size-[22px]">
          <AvatarImage src={getChainIcon(chain)} alt={chain} />
        </Avatar>
      </div>

      <div className="my-auto text-sm">
        <p>
          <span className="text-slate">{chain}: </span>
          {balance} $HELLO
        </p>
      </div>
    </div>
  );
};

export default BalanceOnChain;
