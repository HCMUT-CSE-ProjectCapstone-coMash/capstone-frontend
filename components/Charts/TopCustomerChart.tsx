"use client";

import { FetchTopCustomers } from "@/api/saleOrders/saleOrders";
import { TopCustomerStats } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { useQuery } from "@tanstack/react-query";
import { ArcElement, Chart, ChartData, ChartOptions, Tooltip } from "chart.js";
import { Doughnut } from "react-chartjs-2";

Chart.register(ArcElement, Tooltip);

const COLORS = ["#6420AA", "#DEBDFF", "#FF3EA5", "#FFB5DA", "#808080"];
const COLORS_HOVER = ["#4a1680", "#c99af5", "#e0268a", "#f090c0", "#616161"];

export function TopCustomerChart() {
    const { data, isLoading, isError } = useQuery<TopCustomerStats>({
        queryKey: ["top-customers"],
        queryFn: FetchTopCustomers,
        staleTime: 5 * 60 * 1000,
    });

    const customers = data?.customers ?? [];
    const grandTotal = data?.grandTotal ?? 0;
    const walkInTotal = data?.walkInTotal ?? 0;

    const topTotal = customers.reduce((s, c) => s + c.total, 0);
    const otherTotal = Math.max(0, grandTotal - topTotal - walkInTotal);

    const chartData: ChartData<"doughnut"> = {
        labels: [
            ...customers.map(c => c.name),
            ...(walkInTotal > 0 ? ["Khách vãng lai"] : []),
            ...(otherTotal > 0 ? ["Khác"] : []),
        ],
        datasets: [{
            data: [
                ...customers.map(c => c.total),
                ...(walkInTotal > 0 ? [walkInTotal] : []),
                ...(otherTotal > 0 ? [otherTotal] : []),
            ],
            backgroundColor: [
                ...COLORS.slice(0, customers.length),
                ...(walkInTotal > 0 ? ["#FFB5DA"] : []),
                ...(otherTotal > 0 ? ["#D3D1C7"] : []),
            ],
            hoverBackgroundColor: [
                ...COLORS_HOVER.slice(0, customers.length),
                ...(walkInTotal > 0 ? ["#f090c0"] : []),
                ...(otherTotal > 0 ? ["#B4B2A9"] : []),
            ],
            borderWidth: 2,
            borderColor: "#F9F9FB",
            hoverOffset: 8,
        }],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#3A4163",
                titleColor: "#DEBDFF",
                bodyColor: "#F9F9FB",
                padding: 10,
                callbacks: {
                    label: ctx => {
                        const val = ctx.raw as number;
                        const pct = grandTotal > 0
                            ? ((val / grandTotal) * 100).toFixed(1) : "0";
                        return ` ${formatThousands(val)} VNĐ (${pct}%)`;
                    },
                },
            },
        },
    };

    const pct = (val: number) => grandTotal > 0 ? ((val / grandTotal) * 100).toFixed(1) : "0.0";

    const legendRows = [
        ...customers.map((c, i) => ({ name: c.name, total: c.total, color: COLORS[i] })),
        ...(walkInTotal > 0 ? [{ name: "Khách vãng lai", total: walkInTotal, color: "#FFB5DA" }] : []),
        ...(otherTotal > 0 ? [{ name: "Khác", total: otherTotal, color: "#D3D1C7" }] : []),
    ];

    return (
        <div className="flex flex-col h-full">
            <p className="text-sm text-tgray5 mb-1">Top khách hàng chi tiêu</p>

            {isLoading
                ? <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-5" />
                : <p className="text-2xl font-semibold text-tgray9 mb-5">
                    {formatThousands(grandTotal)}{" "}
                    <span className="text-base font-normal text-tgray5">VNĐ</span>
                  </p>
            }

            {isError && (
                <p className="text-sm text-red mb-4">Không thể tải dữ liệu.</p>
            )}

            {isLoading ? (
                <div className="h-48 w-full bg-gray-50 rounded-lg animate-pulse" />
            ) : (
                <div className="flex items-center gap-6 flex-1">
                    <div className="relative shrink-0" style={{ width: 180, height: 180 }}>
                        <Doughnut data={chartData} options={options} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-xs text-tgray5 leading-tight">Tổng</p>
                            <p className="text-sm font-semibold text-tgray9 leading-snug">
                                {formatThousands(grandTotal)}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-center gap-0 flex-1 min-w-0">
                        {legendRows.map(row => (
                            <div
                                key={row.name}
                                className="flex items-center gap-2 py-2 border-b border-gray-100 last:border-b-0"
                            >
                                <span
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: row.color }}
                                />
                                <span className="text-sm text-tgray9 flex-1 truncate">
                                    {row.name}
                                </span>
                                <span className="text-xs font-medium text-tgray9 shrink-0">
                                    {pct(row.total)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}