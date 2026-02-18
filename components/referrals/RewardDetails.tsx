"use client";

import { Card } from "../ui/card";
import { DollarSign, Users, Zap, Globe, Lock } from "lucide-react";

export default function RewardDetails() {
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-formula font-normal uppercase text-primary">
        Why hello dex?
      </h2>

      {/* Outer Card Container */}
      <Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] p-6 rounded-xl border">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
            <p className="font-sans text-sm text-foreground">
              Earn {" "}
              <span className="text-primary font-semibold text-base">20% commission</span> on every trade your referrals make
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
            <p className="font-sans text-sm text-foreground">
              <span className="text-primary font-semibold text-base">Lifetime rewards</span> with no expiration — keep earning as long as they trade
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
            <p className="font-sans text-sm text-foreground">
              <span className="text-primary font-semibold text-base">Multi-chain support</span> across ETH, BSC & Base with custom links for any token pair
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />
            <p className="font-sans text-sm text-foreground">
              <span className="text-primary font-semibold text-base">Low 0.3% trading fee</span> makes your referrals more likely to trade frequently
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}