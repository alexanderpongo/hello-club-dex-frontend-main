"use client";

import { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ReferenceLine,
  Tooltip,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#c2fe0c",
  },
  //   mobile: {
  //     label: "Mobile",
  //     color: "#4B0082",
  //   },
} satisfies ChartConfig;

export function LPChart() {
  const [bnbToUsdt, setBnbToUsdt] = useState(245); // State for BNB-to-USDT rate
  const [chartData, setChartData] = useState([]); // State for chart data
  const [currentTokenValue, setCurrentTokenValue] = useState(550);
  const [leftIndicator, setLeftIndicator] = useState(220); // Left vertical line (10% left of center)
  const [rightIndicator, setRightIndicator] = useState(270); // Right vertical line (10% right of center)

  useEffect(() => {
    const mockBnbValues = [
      0, 0.001, 0.08, 1.1, 4, 2.01, 3, 1.83, 1, 0.5, 0.8, 1.1, 7, 2.01, 1.01,
    ]; // Example BNB values
    const rate = 245; // Mock BNB-to-USDT rate; replace with API call
    setBnbToUsdt(rate);

    const data: any = mockBnbValues.map((bnb) => ({
      usdt: (bnb * rate).toFixed(2), // Calculate USDT for each BNB value
      bnb: bnb, // Representing BNB values
    }));

    setChartData(data);
  }, []);

  // Handle vertical movement of the left and right indicators
  const handleMouseMove = (e: any, setIndicator: Function) => {
    if (e?.chartY) {
      setIndicator(e.chartY); // Update vertical position of the line
    }
  };

  // Handle mouse down event to initiate dragging
  const handleMouseDown = (e: any, indicator: string) => {
    e.preventDefault();
    const handleMove = (moveEvent: any) => {
      const newY = moveEvent.clientY;
      if (indicator === "left") {
        setLeftIndicator(newY);
      } else if (indicator === "right") {
        setRightIndicator(newY);
      }
    };

    const handleUp = () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);
  };

  return (
    <Card className="border border-[#FFFFFF0D] bg-[#FFFFFF14] ">
      <CardContent className="flex flex-col gap-0 !p-2">
        <ChartContainer config={chartConfig}>
          <AreaChart
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            {/* Define the gradient */}
            <defs>
              <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#c40e6c" stopOpacity={0.8} />
                <stop offset="30%" stopColor="#c40e6c" stopOpacity={0.2} />
                <stop offset="30%" stopColor="#000" stopOpacity={0.9} />
                <stop offset="70%" stopColor="#000" stopOpacity={0.9} />
                <stop offset="50%" stopColor="#c2fe0c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#c2fe0c" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <defs>
              <linearGradient id="colorSplit" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#c40e6c" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#c40e6c" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#c2fe0c" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#c2fe0c" stopOpacity={0.8} />
              </linearGradient>
            </defs>

            {/* <rect x="0" y="0" width="95%" height="100%" fill="url(#colorUv)" /> */}
            {/* <rect
              className="handle handle--w"
              cursor="ew-resize"
              x={50} // Left side of the chart
              y={leftIndicator}
              width={30}
              height="100%"
              fill="#00ffff"
              onMouseDown={(e) => handleMouseDown(e, "left")}
            /> */}

            {/* Right Vertical Line
            <rect
              className="handle handle--w"
              cursor="ew-resize"
              x={250} // Right side of the chart
              y={rightIndicator}
              width={30}
              height={200} // Height of the line
              fill="#4B0082"
              onMouseDown={(e) => handleMouseDown(e, "right")}
            /> */}

            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="usdt"
              tickLine={true}
              axisLine={true}
              tickMargin={8}
            />
            {/* <Tooltip /> */}

            {/* Area chart with gradient fill */}
            <Area
              dataKey="bnb"
              type="monotone"
              fill="url(#colorSplit)"
              fillOpacity={0.91}
              stroke="#c2fe0c"
              strokeWidth={0.5}
            />

            <Area
              type="monotone"
              dataKey="bnb"
              stroke="#c2fe0c"
              fill="url(#colorUv)"
              fillOpacity={0.9}
              strokeWidth={0.5}
            />

            {/* Vertical dotted reference line at center */}
            <ReferenceLine
              x={currentTokenValue.toFixed(2)}
              stroke="#c2fe0c"
              strokeDasharray="4 4"
              label={{
                value: `${currentTokenValue} USDT`,
                position: "top",
                fill: "#c2fe0c",
                fontSize: 12,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
