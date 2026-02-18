import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import Image from 'next/image';
import { Progress } from './ui/progress';
import Bronze from '../public/tiers/bronze.png';
import Silver from '../public/tiers/silver.png';
import Gold from '../public/tiers/gold.png';
import { Button } from './ui/button';

const UserAccessPass = () => {
  return (
    <Card className="card-primary rounded-md relative h-full overflow-hidden">
      <Image
        src="/assets/hello-2.svg"
        alt="hello-2"
        width={100}
        height={100}
        className="absolute w-[180px] bottom-0 right-0 rounded-br-md"
      />
      <CardHeader className="title-regular-semi-bold uppercase">
        YOUR Access Pass: SILVER
        <hr className="title-underline" />
      </CardHeader>

      <CardContent>
        <div className="flex justify-between gap-3">
          <div className="flex flex-col opacity-50">
            <div className="w-[40px] h-auto">
              <Image
                src={Bronze}
                alt="bronze"
                width={100}
                height={100}
                placeholder="blur"
              />
            </div>

            <div>
              <p className="title-small-semi-bold uppercase mt-1 text-center">
                Bronze
              </p>
            </div>
          </div>

          <div className="w-full my-auto">
            <Progress value={100} className="h-1" />
            {/* <p className="text-[9px] text-slate text-center">70,000 $HELLO</p> */}
          </div>

          <div className="flex flex-col">
            <div className="w-[40px] h-auto">
              <Image
                src={Silver}
                alt="silver"
                width={100}
                height={100}
                placeholder="blur"
              />
            </div>

            <div>
              <p className="title-small-semi-bold uppercase mt-1 text-center">
                Silver
              </p>
            </div>
          </div>

          <div className="w-full my-auto">
            <Progress value={20} className="h-1" />
            {/* <p className="text-[9px] text-slate text-center">30,000 $HELLO</p> */}
          </div>

          <div className="flex flex-col opacity-50">
            <div className="w-[40px] h-auto">
              <Image
                src={Gold}
                alt="gold"
                width={100}
                height={100}
                placeholder="blur"
              />
            </div>

            <div>
              <p className="title-small-semi-bold uppercase mt-1 text-center">
                Gold
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <Button className="button-primary">Upgrade Now</Button>
          <Button variant="ghost" className="text-slate">
            Explore Benefits
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserAccessPass;
