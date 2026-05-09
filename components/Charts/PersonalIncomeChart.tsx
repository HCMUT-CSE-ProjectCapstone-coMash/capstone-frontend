"use client";

import { FetchPersonalIncome } from "@/api/saleOrders/saleOrders";
import { PersonalIncomeStats } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { RootState } from "@/utilities/store";
import { useQueries } from "@tanstack/react-query";
import { BarElement, CategoryScale, Chart, ChartData, ChartOptions, LinearScale, Tooltip } from "chart.js";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { useSelector } from "react-redux";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip);

type Period = "day" | "week" | "month" | "quarter";

const PERIODS: { key: Period; label: string }[] = [
    { key: "day",     label: "Ngày"    },
    { key: "week",    label: "Tuần"    },
    { key: "month",   label: "Tháng"   },
    { key: "quarter", label: "Quý"     },
];

const STATS_VI = {
    highest: "Cao nhất",
    average: "Trung bình",
    lowest:  "Thấp nhất",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(d: Date) {
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getTodayIndex(): number {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
}

function buildLayout(): Record<Period, { labels: string[]; sublabels: string[] }> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const jsDay = now.getDay();
    const mondayOffset = jsDay === 0 ? -6 : 1 - jsDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);

    const daySublabels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return fmt(d);
    });

    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const weekRanges: { start: Date; end: Date }[] = [];
    let cursor = new Date(firstOfMonth);
    while (cursor <= lastOfMonth) {
        const start = new Date(cursor);
        const jsDay = cursor.getDay();
        const daysUntilSun = jsDay === 0 ? 0 : 7 - jsDay;
        const end = new Date(cursor);
        end.setDate(cursor.getDate() + daysUntilSun);
        if (end > lastOfMonth) end.setTime(lastOfMonth.getTime());
        weekRanges.push({ start, end });
        cursor = new Date(end);
        cursor.setDate(end.getDate() + 1);
    }

    const monthLabels = ["Th1","Th2","Th3","Th4","Th5","Th6","Th7","Th8","Th9","Th10","Th11","Th12"];
    const monthSublabels = Array.from({ length: 12 }, (_, m) => {
        const start = new Date(year, m, 1);
        const end = new Date(year, m + 1, 0);
        return `${fmt(start)}–${fmt(end)}`;
    });

    const quarterDefs = [
        { label: "Quý I",   start: new Date(year, 0,  1), end: new Date(year, 2,  31) },
        { label: "Quý II",  start: new Date(year, 3,  1), end: new Date(year, 5,  30) },
        { label: "Quý III", start: new Date(year, 6,  1), end: new Date(year, 8,  30) },
        { label: "Quý IV",  start: new Date(year, 9,  1), end: new Date(year, 11, 31) },
    ];

    return {
        day: {
            labels:    ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
            sublabels: daySublabels,
        },
        week: {
            labels:    weekRanges.map((_, i) => `Tuần ${i + 1}`),
            sublabels: weekRanges.map(({ start, end }) => `${fmt(start)}–${fmt(end)}`),
        },
        month: {
            labels:    monthLabels,
            sublabels: monthSublabels,
        },
        quarter: {
            labels:    quarterDefs.map(q => q.label),
            sublabels: quarterDefs.map(q => `${fmt(q.start)}–${fmt(q.end)}`),
        },
    };
}

const LAYOUT = buildLayout();

// ── Component ─────────────────────────────────────────────────────────────────

export function PersonalIncomeChart() {
    const user = useSelector((state: RootState) => state.user);

    const [period, setPeriod] = useState<Period>("day");
    const { labels, sublabels } = LAYOUT[period];

    const results = useQueries({
        queries: PERIODS.map(({ key }) => ({
            queryKey: ["personal-income", key],
            queryFn:  () => FetchPersonalIncome(key, user.id!),
            enabled:  !!user.id && (key === "day" || key === period),
            staleTime: 5 * 60 * 1000,
        })),
    });

    const dataMap = Object.fromEntries(
        PERIODS.map(({ key }, i) => [key, results[i].data as PersonalIncomeStats | undefined])
    ) as Record<Period, PersonalIncomeStats | undefined>;

    const activeIndex = PERIODS.findIndex(p => p.key === period);
    const isLoading = results[activeIndex].isLoading;
    const isError = results[activeIndex].isError;
    const data = dataMap[period];

    const values: number[] = labels.map((_, i) => {
        const match = data?.groups.find(g => g.key === String(i + 1));
        return match?.total ?? 0;
    });

    const todayIndex = getTodayIndex();

    const relevantValues = values.filter((v, i) => {
        if (period === "day") return i <= todayIndex;
        if (period === "month") return i <= new Date().getMonth() && v > 0;
        if (period === "quarter") return i <= Math.floor(new Date().getMonth() / 3) && v > 0;
        return v > 0;
    });

    const total = data?.total ?? 0;
    const high = relevantValues.length ? Math.max(...relevantValues) : 0;
    const low = relevantValues.length ? Math.min(...relevantValues) : 0;
    const avg = relevantValues.length ? Math.round(relevantValues.reduce((a, b) => a + b, 0) / relevantValues.length) : 0;

    const chartData: ChartData<"bar"> = {
        labels,
        datasets: [
            {
                label: "Doanh thu",
                data: values,
                backgroundColor: values.map((_, i) =>
                    period === "day" && i > todayIndex ? "#E5E7EB" : "#DEBDFF"
                ),
                borderRadius: 6,
                hoverBackgroundColor: values.map((_, i) =>
                    period === "day" && i > todayIndex ? "#D1D5DB" : "#6420AA"
                ),
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: "#3A4163",
                titleColor: "#DEBDFF",
                bodyColor: "#F9F9FB",
                padding: 10,
                callbacks: {
                    title: ctx => {
                        const i = ctx[0].dataIndex;
                        return `${labels[i]}  •  ${sublabels[i]}`;
                    },
                    label: ctx => `${formatThousands(ctx.raw as number)} VNĐ`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: "#616161",
                    font: { size: 11 },
                    maxRotation: 0,
                    callback: function(_, index) {
                        return [labels[index], sublabels[index]];
                    },
                },
            },
            y: {
                grid: { color: "rgba(100,32,170,0.08)" },
                border: { display: false },
                ticks: {
                    color: "#616161",
                    font: { size: 11 },
                    callback: v => formatThousands(v as number),
                },
            },
        },
    };

    return (
        <>
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                    <p className="text-sm text-tgray5">Tổng doanh thu</p>
                    {isLoading
                        ? <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mt-1" />
                        : <p className="text-2xl font-semibold text-tgray9">
                            {formatThousands(total)} <span className="text-base font-normal text-tgray5">VNĐ</span>
                          </p>
                    }
                </div>
                <div className="flex gap-2">
                    {PERIODS.map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setPeriod(key)}
                            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors font-medium ${
                                period === key
                                ? "bg-purple text-white"
                                : "bg-transparent text-tgray5 border-gray-200 hover:border-light-purple hover:text-purple"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {isError && (
                <p className="text-sm text-red mb-4">Không thể tải dữ liệu doanh thu.</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                    { label: STATS_VI.highest, value: high, color: "text-purple" },
                    { label: STATS_VI.average, value: avg,  color: "text-tgray6" },
                    { label: STATS_VI.lowest,  value: low,  color: "text-pink"   },
                ].map(s => (
                    <div key={s.label} className="bg-tgray05 rounded-lg p-3 border border-gray-100">
                        <p className="text-xs text-tgray5 mb-1">{s.label}</p>
                        {isLoading
                            ? <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
                            : <p className={`text-sm font-semibold ${s.color}`}>
                                {formatThousands(s.value)} <span className="font-normal text-tgray5 text-xs">VNĐ</span>
                              </p>
                        }
                    </div>
                ))}
            </div>

            {/* Chart */}
            <div className="relative h-72">
                {isLoading
                    ? <div className="h-full w-full bg-gray-50 rounded-lg animate-pulse" />
                    : <Bar data={chartData} options={options} />
                }
            </div>
        </>
    );
}