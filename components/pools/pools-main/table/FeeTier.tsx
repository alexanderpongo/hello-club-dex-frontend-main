import React from "react";

interface FeeTierProps {
  feeTier: string;
}

const FeeTier: React.FC<FeeTierProps> = (props) => {
  const { feeTier } = props;
  return (
    <div className="font-lato inline-flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-black/10 dark:hover:bg-white/10 dark:bg-white/5 bg-black/5 dark:text-white/80 text-black border border-black/10 dark:border-white/10 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase">
      {feeTier}
    </div>
  );
};

export default FeeTier;
