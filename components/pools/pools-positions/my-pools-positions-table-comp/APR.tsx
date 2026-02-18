import React from "react";

interface APRProps {
  apr: number;
}

const APR: React.FC<APRProps> = (props) => {
  const { apr } = props;
  return (
    <div>
      {apr === 0 ? (
        <span className="">0%</span>
      ) : apr > 0 ? (
        <span className="text-primary">{apr.toFixed(2)}%</span>
      ) : (
        <span className="text-[#f87171]">{apr.toFixed(2)}%</span>
      )}
    </div>
  );
};

export default APR;
