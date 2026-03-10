import React, { useId, useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

const generateSmoothTrend = () => {
    let current = 10 + Math.random() * 5
    return Array.from({ length: 10 }, () => {
        current += Math.random() * 5
        return { v: current }
    })
}

export const YieldSparkline = () => {
    const id = useId()
    const data = useMemo(() => generateSmoothTrend(), [])

    return (
        <div className="h-[24px] w-[70px] ml-auto overflow-visible group/sparkline">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                        <linearGradient id={`sparkGradient-${id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ADFF2F" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#ADFF2F" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="v"
                        stroke="#ADFF2F"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fillOpacity={1}
                        fill={`url(#sparkGradient-${id})`}
                        isAnimationActive={true}
                        animationDuration={1200}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}
