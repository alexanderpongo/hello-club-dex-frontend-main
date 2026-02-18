import React from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';
import Spinner from './Spinner';

const GlassStatCard = ({
  label,
  value,
  avatarImage,
  isLoading,
}: StatCardProps) => {
  return (
    <Card className="card-primary rounded-lg p-3">
      <CardContent className="p-4">
        <div className="flex justify-between">
          <div className="my-auto">
            <p>{label}</p>
          </div>

          <div className="flex gap-2 my-auto">
            <Avatar className="size-[27px] my-auto">
              <AvatarImage src={avatarImage} alt={label} />
            </Avatar>

            <h2 className="text-[20px] font-bold leading-6 my-auto">
              {isLoading ? <Spinner className="text-primary" /> : value}
            </h2>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GlassStatCard;
