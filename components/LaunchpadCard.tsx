import React from 'react';
import { Card, CardContent } from './ui/card';
import Image from 'next/image';
import { Avatar, AvatarImage } from './ui/avatar';
import { RiFileCopyLine } from 'react-icons/ri';

const LaunchpadCard = ({ project }: { project: LaunchpadProject }) => {
  return (
    <Card className="card-primary rounded-md">
      <CardContent className="p-4">
        <Image
          src={project.coverImage}
          alt={project.title}
          width={1000}
          height={1000}
          quality={100}
          className="w-full aspect-[5/2] object-cover rounded-sm"
        />

        {/* <Avatar className="size-[80px] -mt-12 ml-3 ring-1 ring-white/20">
          <AvatarImage src={project.avatarImage} alt={project.title} />
        </Avatar> */}

        <h1 className="title-regular-bold text-primary uppercase mt-8">
          {project.title}
        </h1>

        <div className="mt-4 text-sm flex flex-col gap-2">
          <div className="flex justify-between">
            <p className="text-slate">Token Price</p>
            <p className="text-nowrap">{`${project.tokenPrice} ${project.tokenSymbol}`}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-slate">Register Period</p>
            <p>{project.registerPeriod}</p>
          </div>

          <div className="flex justify-between">
            <p className="text-slate">Project Network</p>
            <div className="flex gap-2">
              <p>{project.projectNetwork}</p>

              <Avatar className="size-5">
                <AvatarImage src={project.networkIcon} alt={project.title} />
              </Avatar>
            </div>
          </div>

          <div className="flex justify-between">
            <p className="text-slate">Token Contract</p>
            <div className="flex gap-2">
              <p className="my-auto">{project.tokenContract}</p>

              <RiFileCopyLine className="my-auto cursor-pointer" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LaunchpadCard;
