import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const UserClaimedRewards = () => {
  return (
    <Card className="card-primary rounded-md h-full">
      <CardHeader className="title-regular-semi-bold uppercase">
        Your Claimed Rewards
        <hr className="title-underline" />
      </CardHeader>

      <CardContent>
        <div className="flex gap-3">
          <div className="my-auto">
            <Avatar className="size-8">
              <AvatarImage src="/icons/tether.svg" alt="tether" />
            </Avatar>
          </div>

          <div className="my-auto">
            <h2 className="title-large-semi-bold">247</h2>
          </div>
        </div>

        <div className="mt-3">
          <p className="text-slate">
            Missed <span className="text-white font-bold">375 USDT</span> with{' '}
            <span className="text-white font-bold">Gold Tier.</span>
          </p>
          <p className="text-slate">Don&apos;t miss out - upgrade now!</p>
        </div>

        <div className="mt-2">
          <Button className="button-primary">Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserClaimedRewards;
