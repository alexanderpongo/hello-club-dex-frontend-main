import React from 'react';

const ComingSoonComponent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative max-h-[250px] overflow-hidden rounded-md w-full">
      {/* Shadow overlay and "Upcoming" label */}
      <div className="absolute inset-0 bg-black bg-opacity-40 rounded-md backdrop-blur flex items-center justify-center z-10">
        <h1 className="title-regular-semi-bold uppercase">Coming Soon</h1>
      </div>
      {children}
    </div>
  );
};

export default ComingSoonComponent;
