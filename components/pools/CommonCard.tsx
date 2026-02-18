import React from "react";

interface CommonCardProps {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}

const CommonCard: React.FC<CommonCardProps> = (props) => {
  const { title, value, icon } = props;
  return (
    <div className="dark:bg-[#121212] bg-slate-100 shadow border border-[rgba(255,255,255,0.08)] rounded-xl p-4 w-full ">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
            {title}
          </div>
          <div className="text-xl dark:text-white/80 text-black/80">
            {value}
          </div>
        </div>
        <div className="w-8 h-8 dark:bg-[rgba(173,255,47,0.1)] bg-[rgba(173,255,47,0.1)] flex items-center justify-center rounded-full">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default CommonCard;
