import React from 'react';
import LaunchpadCard from './LaunchpadCard';
import ComingSoonComponent from './ComingSoonComponent';

const LaunchpadSection = () => {
  const projects: LaunchpadProject[] = [
    {
      title: 'Kima Network',
      coverImage: '/assets/launchpad/p1_cover.png',
      avatarImage: '/assets/launchpad/p1_avatar.png',
      tokenPrice: 0.001,
      tokenSymbol: 'USDT',
      registerPeriod: 'TBA',
      projectNetwork: 'BSC',
      networkIcon: '/icons/bsc.svg',
      tokenContract: '0x0a..0bd4',
    },
    {
      title: 'Lympid',
      coverImage: '/assets/launchpad/p2_cover.png',
      avatarImage: '/assets/launchpad/p2_avatar.png',
      tokenPrice: 0.001,
      tokenSymbol: 'USDT',
      registerPeriod: 'TBA',
      projectNetwork: 'BSC',
      networkIcon: '/icons/bsc.svg',
      tokenContract: '0x0a..0bd4',
    },
    {
      title: 'Chainhealth',
      coverImage: '/assets/launchpad/p3_cover.png',
      avatarImage: '/assets/launchpad/p3_avatar.png',
      tokenPrice: 0.001,
      tokenSymbol: 'USDT',
      registerPeriod: 'TBA',
      projectNetwork: 'BSC',
      networkIcon: '/icons/bsc.svg',
      tokenContract: '0x0a..0bd4',
    },
  ];

  return (
    <ComingSoonComponent>
      <div className="grid grid-cols-3 gap-3 mt-5">
        {projects.map((project, index) => (
          <div className="col-span-3 lg:col-span-1" key={index}>
            <LaunchpadCard project={project} />
          </div>
        ))}
      </div>
    </ComingSoonComponent>
  );
};

export default LaunchpadSection;
