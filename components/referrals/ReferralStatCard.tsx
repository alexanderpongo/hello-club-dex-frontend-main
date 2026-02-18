"use client";

import React from "react";
import { Card, CardContent } from "../ui/card";
import { Users, DollarSign } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { renderFormattedValue } from "@/components/trading-live/coin-table-new/utils";

type ReferralStatCardProps = {
	value: number | string | React.ReactNode;
	label: string;
	variant?: "default" | "earnings";
	icon?: React.ReactNode;
	isLoading?: boolean;
};

export default function ReferralStatCard({
	value,
	label,
	variant = "default",
	icon,
	isLoading = false,
}: ReferralStatCardProps) {
	const Icon =
		icon ?? (variant === "earnings" ? <DollarSign className="w-4 h-4 text-[#00ffff]" /> : <Users className="w-4 h-4 text-primary" />);

	return (
		<Card className="dark:bg-[#121212] bg-slate-100 border-black/10 dark:border-[rgba(255,255,255,0.03)] overflow-hidden rounded-xl border">
			<CardContent className="p-4">
				<div className="flex items-center gap-4">
					<div className={`w-8 h-8 ${variant === "earnings" ? "bg-[#00ffff]/10" : "bg-primary/10"} flex items-center justify-center rounded-full`}>
						{Icon}
					</div>
					<div className="flex-1">
						<div className="font-display text-xl leading-none font-thin">
							{isLoading ? (
								<Skeleton className="h-6 w-20" />
							) : typeof value === "number" ? (
								renderFormattedValue(value as number)
							) : (
								value
							)}
						</div>
						<div className="font-sans text-[10px] dark:text-[#a3a3a3] text-gray-500 uppercase tracking-wider mt-0.5">
							{label}
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

