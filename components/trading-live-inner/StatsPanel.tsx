import { TrendingUp, BarChart3, Droplets, Users } from "lucide-react";
import { Card } from "../ui/card";

export function StatsPanel() {
  return (
    <Card className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
      {/* Header */}
      <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-lime-400">
        Stats
      </h2>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        {/* Market Cap */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-zinc-900 p-2">
            <TrendingUp className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">MARKET CAP</div>
            <div className="text-sm font-semibold text-white">290K</div>
            <div className="text-xs font-medium text-lime-400">+231.4%</div>
          </div>
        </div>

        {/* 24H Volume */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-zinc-900 p-2">
            <BarChart3 className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">24H VOLUME</div>
            <div className="text-sm font-semibold text-white">4.30M</div>
          </div>
        </div>

        {/* Liquidity */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-zinc-900 p-2">
            <Droplets className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">LIQUIDITY</div>
            <div className="text-sm font-semibold text-white">71K</div>
          </div>
        </div>

        {/* Holders */}
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-zinc-900 p-2">
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">HOLDERS</div>
            <div className="text-sm font-semibold text-white">5K</div>
          </div>
        </div>
      </div>

      {/* Key-Value Pairs */}
      <div className="space-y-3 border-t border-zinc-800 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Age</span>
          <span className="text-sm font-medium text-white">5h</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Txns 24h</span>
          <span className="text-sm font-medium text-white">31K</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">FDV</span>
          <span className="text-sm font-medium text-white">$290900.00</span>
        </div>
      </div>

      {/* Pool Section */}
      <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Pool
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">SOL</span>
          <span className="text-sm font-medium text-white">35.5</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Token</span>
          <span className="text-sm font-medium text-white">122.00M</span>
        </div>
      </div>
    </Card>
  );
}
