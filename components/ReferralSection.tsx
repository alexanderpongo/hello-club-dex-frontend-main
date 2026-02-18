import React from 'react';
import { Card, CardContent, CardDescription, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';

const ReferralSection = () => {
  return (
    <Card className="card-primary">
      <CardHeader>
        <p className="text-[20px]">Referral Program</p>
        <CardDescription className="text-white/80">
          Get 25 USDT in HELLO whenever a friend you refer spends $100 on one of
          our ecosystem projects.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-3 gap-5">
          <Card className="col-span-3 md:col-span-1 card-primary p-3 text-center !bg-[#222222]">
            <p className="text-slate text-sm">Referrals</p>
            <p className="text-primary">3</p>
          </Card>

          <Card className="col-span-3 md:col-span-1 card-primary p-3 text-center !bg-[#222222]">
            <p className="text-slate text-sm">Completed</p>
            <p className="text-primary">2</p>
          </Card>

          <Card className="col-span-3 md:col-span-1 card-primary p-3 text-center !bg-[#222222]">
            <p className="text-slate text-sm">Total Rewards</p>
            <p className="text-primary">50 HELLO</p>
          </Card>
        </div>

        <div className="mt-5">
          <p className='text-sm'>Your Referral Code</p>
          <div className="flex gap-3 input-primary p-1 mt-2">
            <Input
              disabled
              className="border-none"
              value={'HELLO-ABCD1234'}
            />

            <Button size="sm" className="button-primary my-auto !rounded-[6px]">
              Copy
            </Button>
          </div>
        </div>

        <div className="mt-5">
          <p className='text-sm'>Your Referral Link</p>
          <div className="flex gap-3 input-primary p-1 mt-2">
            <Input
              disabled
              className="border-none"
              value={'https://hello.one/ref?code=ABCD1234'}
            />

            <Button size="sm" className="button-primary my-auto !rounded-[6px]">
              Copy
            </Button>
          </div>
        </div>

        <Button className='button-primary mt-5 uppercase w-full md:w-auto'>View Activity</Button>
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
