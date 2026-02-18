import Image from "next/image";
import React from "react";

function HomeBg() {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      {/* Top Left */}
      <Image
        src="/images/image-1.svg"
        alt="Top Left Logo"
        width={100}
        height={140}
        priority
        className="absolute top-30 left-40"
      />

      {/* Top Right */}
      <Image
        src="/images/image-2.svg"
        alt="Top Right Logo"
        width={100}
        height={100}
        priority
        className="absolute top-32 right-20"
      />

      {/* Bottom Left */}
      <Image
        src="/images/image-3.svg"
        alt="Bottom Left Logo"
        width={100}
        height={120}
        priority
        className="absolute bottom-60 left-20"
      />

      {/* Bottom Right */}
      <Image
        src="/images/image-4.svg"
        alt="Bottom Right Logo"
        width={100}
        height={100}
        priority
        className="absolute bottom-40 right-40"
      />
    </div>
  );
}

export default HomeBg;
