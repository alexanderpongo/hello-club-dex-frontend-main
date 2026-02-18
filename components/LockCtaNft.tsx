'use client';
import React from 'react';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import NftImage from '@/public/tiers/default.gif';
import { Button } from './ui/button';
import Link from 'next/link';

const LockCtaNft = () => {
  return (
    <div className="relative h-full w-full">
      {/* Shadow overlay and "Upcoming" label */}
      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md backdrop-blur flex items-center justify-center z-10">
        <Button className="button-primary uppercase" asChild>
          <Link href="/lock">Lock Tokens to get NFT</Link>
        </Button>
      </div>
      <Card className="rounded-lg p-0 border-none">
        <Image
          src={NftImage}
          alt="nft"
          width={1000}
          height={1000}
          quality={100}
          unoptimized
          className="object-cover rounded-t-lg "
        />
        <CardContent className="!p-0">
          <div className="bg-[#151515] p-3 rounded-b-lg">
            <h1 className="title-regular-bold uppercase flex gap-1">
              Bronze Tier
            </h1>
            <p className="flex gap-1 text-slate">NFT ID #1</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LockCtaNft;
