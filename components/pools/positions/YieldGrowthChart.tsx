"use client"

import React, { useState } from "react"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    CartesianGrid,
    ReferenceLine
} from "recharts"

const mockData: Record<string, any[]> = {
    "1D": [
        { time: "00:00", value: 1.2 },
        { time: "04:00", value: 1.8 },
        { time: "08:00", value: 2.1 },
        { time: "12:00", value: 3.5 },
        { time: "16:00", value: 4.2 },
        { time: "20:00", value: 5.6 },
        { time: "23:59", value: 6.8 },
    ],
    "7D": [
        { time: "Mon", value: 12 },
        { time: "Tue", value: 19 },
        { time: "Wed", value: 15 },
        { time: "Thu", value: 22 },
        { time: "Fri", value: 30 },
        { time: "Sat", value: 28 },
        { time: "Sun", value: 35 },
    ],
    "1M": [
        { time: "W1", value: 120 },
        { time: "W2", value: 240 },
        { time: "W3", value: 210 },
        { time: "W4", value: 325 },
    ],
}

const periods = ["1D", "7D", "1M"]

export const YieldGrowthChart = () => {
    const [period, setPeriod] = useState("7D")
    const currentData = mockData[period]
    const latestValue = currentData[currentData.length - 1].value

    return (
        <div className="w-full">
            <div className="flex flex-col lg:flex-row items-center gap-8">

                {/* Content Left */}
                <div className="w-full lg:w-auto flex flex-col justify-between min-w-[220px] gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary shadow-[0_0_8px_#ADFF2F]" />
                            <p className="text-[9px] uppercase text-gray-400 tracking-[0.2em] font-medium">Accumulated Yield</p>
                        </div>
                        <div className="flex items-baseline gap-2.5">
                            <h3 className="text-4xl font-formula dark:text-white text-black tracking-tighter">${latestValue.toLocaleString()}</h3>
                            <span className="text-sm font-formula text-primary">+12.45%</span>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total position performance</p>
                    </div>

                    <div className="flex bg-white/5 p-0.5 rounded-lg border border-white/5 h-8 self-start">
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

                {/* Compact Chart Right */}
                <div className="flex-1 w-full h-[160px] relative overflow-visible">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentData} margin={{ top: 10, right: 0, left: 10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="yieldGradientDetailCompact" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ADFF2F" stopOpacity={0.1} />
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
                                cursor={{ stroke: "rgba(173,255,47,0.15)", strokeWidth: 1 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#ADFF2F"
                                strokeWidth={1.5}
                                fill="url(#yieldGradientDetailCompact)"
                                animationDuration={800}
                                strokeLinecap="round"
                            />
                            <ReferenceLine
                                y={latestValue}
                                stroke="#ADFF2F"
                                strokeDasharray="3 3"
                                strokeOpacity={0.1}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
