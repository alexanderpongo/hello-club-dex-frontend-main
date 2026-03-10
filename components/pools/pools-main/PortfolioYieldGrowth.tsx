"use client"

import React, { useState } from "react"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    ReferenceLine
} from "recharts"

const mockData: Record<string, any[]> = {
    "1D": [
        { time: "00:00", value: 240 },
        { time: "04:00", value: 310 },
        { time: "08:00", value: 280 },
        { time: "12:00", value: 450 },
        { time: "16:00", value: 520 },
        { time: "20:00", value: 480 },
        { time: "23:59", value: 625 },
    ],
    "7D": [
        { time: "Mon", value: 2100 },
        { time: "Tue", value: 2450 },
        { time: "Wed", value: 2300 },
        { time: "Thu", value: 2800 },
        { time: "Fri", value: 3100 },
        { time: "Sat", value: 3500 },
        { time: "Sun", value: 4200 },
    ],
    "1M": [
        { time: "Week 1", value: 8000 },
        { time: "Week 2", value: 12000 },
        { time: "Week 3", value: 11000 },
        { time: "Week 4", value: 15400 },
    ],
}

const periods = ["1D", "7D", "1M"]

const PortfolioYieldGrowth = () => {
    const [period, setPeriod] = useState("1D")
    const currentData = mockData[period]
    const latestValue = currentData[currentData.length - 1].value

    return (
        <div className="w-full mb-6">
            <div className="dark:bg-[#121212]/40 bg-slate-100/40 border border-[rgba(255,255,255,0.06)] rounded-xl overflow-hidden backdrop-blur-sm group p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">

                    {/* Content Left */}
                    <div className="w-full md:w-auto flex flex-col justify-between min-w-[240px] gap-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_#ADFF2F]" />
                                <p className="text-[9px] uppercase text-gray-400 tracking-[0.2em] font-medium">Yield Growth</p>
                            </div>
                            <div className="flex items-baseline gap-2.5">
                                <h2 className="text-4xl font-formula dark:text-white text-black tracking-tighter">${latestValue.toLocaleString()}</h2>
                                <span className="text-sm font-formula text-primary">+12.5%</span>
                            </div>
                            <p className="text-[10px] uppercase text-gray-500 tracking-wider">Estimated Monthly Accumulation: <span className="dark:text-white text-black font-formula ml-1">$1,840.45</span></p>
                        </div>

                        <div className="flex bg-black/30 p-0.5 rounded-lg border border-white/5 h-8 self-start">
                            {periods.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`px-4 rounded-md text-[9px] font-formula transition-all ${period === p
                                        ? "bg-primary text-black"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Highly Minimalist Chart Right */}
                    <div className="flex-1 h-[140px] relative overflow-visible">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={currentData} margin={{ top: 10, right: 0, left: 10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="heroYieldGradientFinal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ADFF2F" stopOpacity={0.08} />
                                        <stop offset="100%" stopColor="#ADFF2F" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="dark:bg-black bg-white border border-white/10 px-2 py-1 rounded shadow-xl">
                                                    <p className="text-[10px] font-formula text-primary">${payload[0].value?.toLocaleString()}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                    cursor={{ stroke: "rgba(173,255,47,0.1)", strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#ADFF2F"
                                    strokeWidth={1.2}
                                    fill="url(#heroYieldGradientFinal)"
                                    animationDuration={800}
                                    strokeLinecap="round"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PortfolioYieldGrowth
