import React from 'react';
import topLeft from '../public/assets/background/top-left.png';
import topRight from '../public/assets/background/top-right.png';
import bottomLeft from '../public/assets/background/bottom-left.png';
import bottomRight from '../public/assets/background/bottom-right.png';
import Image from 'next/image';

const BackgroundImages = () => {
  return (
    <div className='hidden xl:block'>
      <Image
        src={topLeft}
        alt="top-left"
        width={100}
        height={100}
        className="fixed w-[150px] top-20 left-0 -z-10"
      />

      <Image
        src={topRight}
        alt="top-right"
        width={100}
        height={100}
        className="fixed w-[150px] top-12 right-0 -z-10"
      />

      <Image
        src={bottomLeft}
        alt="bottom-left"
        width={100}
        height={100}
        className="fixed w-[150px] bottom-12 left-0 -z-10"
      />

      <Image
        src={bottomRight}
        alt="bottom-right"
        width={100}
        height={100}
        className="fixed w-[150px] bottom-20 right-0 -z-10"
      />
    </div>
  );
};

export default BackgroundImages;
