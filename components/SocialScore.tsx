import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

const SocialScore = () => {
  return (
    <Card className="bg-transparent border-none shadow-none hidden md:block fixed z-20 container pr-6 xl:px-0">
      <div className="flex justify-self-end w-full md:max-w-[350px] bg-black/40 mt-3 ring-1 ring-white/10 rounded-md shadow-md">
        <CardContent className="p-2">
          <div className="flex gap-2 my-auto">
            <Button variant="ghost" className="score-button">
              <h1 className="title-regular-bold text-center">97241</h1>
            </Button>
            <div className="my-auto">
              <h1 className="title-regular-bold">Your Social Score</h1>
              <p className='text-sm'>
                Complete <span className="text-primary">quests</span> to boost
                your score!
              </p>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default SocialScore;
