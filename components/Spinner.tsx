import { cn } from '@/lib/utils';
import React from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

const Spinner = ({ className }: { className?: string }) => {
  return <AiOutlineLoading className={cn('animate-spin', className)} />;
};

export default Spinner;
