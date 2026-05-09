"use client";

import { FetchDashboardStats } from "@/api/saleOrders/saleOrders";
import { FetchNewCustomerStats } from "@/api/customers/customers";
import { DashboardStatsDto } from "@/types/saleOrder";
import { NewCustomerStatsDto } from "@/types/customer";
import { CardIcon, OrderIcon, ProfitIcon, TrendDownIcon, TrendUpIcon, UserIcon } from "@/public/assets/Icons";
import { formatThousands } from "@/utilities/numberFormat";
import { useQueries } from "@tanstack/react-query";

function calcDiff(today: number, yesterday: number): string {
    if (yesterday === 0) return today > 0 ? "+100%" : "0%";
    const pct = ((today - yesterday) / yesterday) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
}

function calcTrend(today: number, yesterday: number): "up" | "down" {
    return today >= yesterday ? "up" : "down";
}

export function StatsCard() {
    const results = useQueries({
        queries: [
            {
                queryKey: ["dashboard-stats"],
                queryFn: FetchDashboardStats,
                staleTime: 5 * 60 * 1000,
            },
            {
                queryKey: ["new-customer-stats"],
                queryFn: FetchNewCustomerStats,
                staleTime: 5 * 60 * 1000,
            },
        ],
    });

    const statsData = results[0].data as DashboardStatsDto | undefined;
    const customerData = results[1].data as NewCustomerStatsDto | undefined;
    const isLoading = results.some(r => r.isLoading);

    const stats = [
        {
            label: "Doanh thu hôm nay",
            value: statsData ? formatThousands(statsData.totalSaleToday) : "—",
            unit: "VNĐ",
            sub: statsData ? calcDiff(statsData.totalSaleToday, statsData.totalSaleYesterday) : "—",
            subLabel: "so hôm qua",
            trend: statsData ? calcTrend(statsData.totalSaleToday, statsData.totalSaleYesterday) : "up" as const,
            icon: <CardIcon width={15} height={15} className="text-purple" />,
        },
        {
            label: "Đơn hàng hôm nay",
            value: statsData ? `${statsData.totalOrderToday}` : "—",
            unit: "đơn",
            sub: statsData ? calcDiff(statsData.totalOrderToday, statsData.totalOrderYesterday) : "—",
            subLabel: "so hôm qua",
            trend: statsData ? calcTrend(statsData.totalOrderToday, statsData.totalOrderYesterday) : "up" as const,
            icon: <OrderIcon width={15} height={15} className="text-purple" />,
        },
        {
            label: "Khách hàng mới",
            value: customerData ? `${customerData.todayCount}` : "—",
            unit: "khách",
            sub: customerData ? calcDiff(customerData.todayCount, customerData.yesterdayCount) : "—",
            subLabel: "so hôm qua",
            trend: customerData ? calcTrend(customerData.todayCount, customerData.yesterdayCount) : "up" as const,
            icon: <UserIcon width={15} height={15} className="text-purple" />,
        },
        {
            label: "Lợi nhuận hôm nay",
            value: statsData ? formatThousands(statsData.profitToday) : "—",
            unit: "VNĐ",
            sub: statsData ? calcDiff(statsData.profitToday, statsData.profitYesterday) : "—",
            subLabel: "so hôm qua",
            trend: statsData ? calcTrend(statsData.profitToday, statsData.profitYesterday) : "up" as const,
            icon: <ProfitIcon width={15} height={15} className="text-purple" />,
        },
    ];

    return (
        <div className="flex flex-col gap-3 h-full">
            {stats.map((s, i) => (
                <div key={i} className="border border-gray-300 rounded-2xl px-4 py-3 flex flex-1 items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple/10">
                        {s.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-tgray5 mb-0.5">{s.label}</p>
                        {isLoading ? (
                            <div className="h-6 w-24 bg-gray-100 rounded animate-pulse mt-1" />
                        ) : (
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-semibold text-tgray9">{s.value}</span>
                                <span className="text-xs text-tgray5">{s.unit}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                        {isLoading ? (
                            <div className="h-5 w-12 bg-gray-100 rounded-full animate-pulse" />
                        ) : (
                            <>
                                <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    s.trend === "up"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red/10 text-red"
                                }`}>
                                    {s.trend === "up"
                                        ? <TrendUpIcon width={10} height={10} className="" />
                                        : <TrendDownIcon width={10} height={10} className="" />
                                    }
                                    {s.sub}
                                </span>
                                <span className="text-xs text-tgray5">{s.subLabel}</span>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}