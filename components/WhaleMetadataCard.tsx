import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';

const WhaleMetadataCard = ({
  whaleMetadata,
}: {
  whaleMetadata: WhaleMetadata;
}) => {
  return (
    <Card className="card-primary rounded-md">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="my-auto">
            <Avatar className="size-[60px]">
              <AvatarImage
                src={whaleMetadata.avatarImage}
                alt={whaleMetadata.firstName}
              />
              <AvatarFallback>{whaleMetadata.firstName}</AvatarFallback>
            </Avatar>
          </div>

          <div className="my-auto">
            <h1 className="title-regular-bold">{`${whaleMetadata.firstName} ${whaleMetadata.lastName}`}</h1>
            <p className="text-slate">{whaleMetadata.profession}</p>
          </div>
        </div>

        <div className="mt-5 text-sm">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <p className="text-slate">7 Days PNL</p>
              <p
                className={
                  whaleMetadata.sevenDaysPnl > 0 ? 'text-plus' : 'text-minus'
                }
              >{`${whaleMetadata.sevenDaysPnl > 0 ? '+' : ''}${
                whaleMetadata.sevenDaysPnl
              }`}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-slate">ROI</p>
              <p
                className={whaleMetadata.roi > 0 ? 'text-plus' : 'text-minus'}
              >{`${whaleMetadata.roi > 0 ? '+' : ''}${whaleMetadata.roi}%`}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-slate">AUM</p>
              <p>{whaleMetadata.aum.toLocaleString()}</p>
            </div>

            <div className="flex justify-between">
              <p className="text-slate">7 Days MDD</p>
              <p>{whaleMetadata.sevenDaysMdd}%</p>
            </div>

            <div className="flex justify-between">
              <p className="text-slate">Sharpe Ratio</p>
              <p>{whaleMetadata.sharpeRatio ?? '-'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="col-span-1">
              <Button className="button-primary w-full">{`Invest with ${whaleMetadata.firstName}`}</Button>
            </div>

            <div className="col-span-1">
              <Button className="button-primary !bg-transparent !text-white ring-1 ring-inset ring-primary w-full">{`+ Follow ${whaleMetadata.firstName}`}</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhaleMetadataCard;
