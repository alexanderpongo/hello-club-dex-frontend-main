import React from "react";
import { Card } from "../ui/card";
import CountdownTimer from "../CountDown";

interface LockDetail {
  title: string;
  value: string;
  subtitle?: string;
  timeStamp?: number | undefined;
}

interface LockDetailsCardProps {
  data: LockDetail;
  colorClass?: string;
}

const LockDetailsCard: React.FC<LockDetailsCardProps> = ({
  data,
  colorClass,
}) => {

  return (
    <Card className="dark:bg-[#151515] bg-slate-100 p-4 rounded-xl border border-black/10 dark:border-white/10 grow w-full shadow-none transition-all duration-300">
      <div className="text-[10px] dark:text-[#a3a3a3] text-gray-500 mb-1 uppercase tracking-wider font-lato">
        {data.title}
      </div>
      <div className="flex justify-start items-center gap-2">
        <div className="text-sm sm:text-lg md:text-xl font-formula dark:text-white uppercase tracking-tight truncate">
          {data.value}
        </div>
        {data.subtitle && (
          <span className={`text-[10px] mt-0.5 ${colorClass} bg-black/10 dark:bg-white/5 py-0.5 px-2 rounded-full border border-black/5 dark:border-white/10 flex justify-center items-center font-formula`}>
            {/* {data.subtitle} */}
            <CountdownTimer endTime={data?.timeStamp!} />
          </span>
        )}
      </div>
    </Card>
  );
};

export default LockDetailsCard;
