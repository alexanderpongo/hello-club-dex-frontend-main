import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import Spinner from './Spinner';

const StatCard = ({ label, value, avatarImage, isLoading }: StatCardProps) => {
  return (
    <Card className="card-primary rounded-lg h-full">
      <CardContent className="p-3">
        <div className="flex justify-between">
          <div className="my-auto">
            <p className="whitespace-pre text-xs lg:text-base">{label}</p>
          </div>

          <div className="flex gap-2 my-auto">
            <div className="my-auto">
              <Avatar className="size-6 lg:size-8">
                <AvatarImage src={avatarImage} alt={label} />
              </Avatar>
            </div>

            <div className="title-regular-semi-bold lg:title-large-semi-bold my-auto">
              {isLoading ? (
                <Spinner className="text-primary" />
              ) : (
                <h1>{value}</h1>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
