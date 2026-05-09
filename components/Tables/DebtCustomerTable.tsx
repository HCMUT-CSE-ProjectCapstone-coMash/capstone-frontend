"use client";

import { FetchTop5DebtCustomers } from "@/api/customers/customers"; 
import { CardIcon } from "@/public/assets/Icons";
import { Customer } from "@/types/customer";
import { formatThousands } from "@/utilities/numberFormat";
import { useQuery } from "@tanstack/react-query";

function getInitials(name: string) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLORS = [
    { bg: "bg-purple/15",     text: "text-purple"  },
    { bg: "bg-light-pink/40", text: "text-pink"    },
    { bg: "bg-teal-100",      text: "text-teal-700"},
    { bg: "bg-blue-100",      text: "text-blue-700"},
    { bg: "bg-pink-100",      text: "text-pink-600"},
];

function getDebtDaysStyle(days: number) {
    if (days >= 7) return "bg-red/10 text-red";
    if (days >= 4) return "bg-amber-50 text-amber-700";
    return "bg-gray-100 text-tgray6";
}

export function DebtCustomerTable() {
    const { data, isLoading, isError } = useQuery<Customer[]>({
        queryKey: ["top-5-debt-customers"],
        queryFn: FetchTop5DebtCustomers,
        staleTime: 5 * 60 * 1000,
    });

    const customers = data ?? [];

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-tgray05 border border-gray-100 flex items-center justify-center">
                    <CardIcon width={16} height={16} className="text-tgray5" />
                </div>
                <p className="text-base font-semibold text-tgray9">Khách hàng công nợ cao</p>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 px-1 mb-2">
                <p className="text-xs text-tgray5">Khách hàng</p>
                <p className="text-xs text-tgray5">Công nợ</p>
                <p className="text-xs text-tgray5">Số ngày nợ</p>
            </div>

            {isError && (
                <p className="text-sm text-red py-4">Không thể tải dữ liệu.</p>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-3 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col">
                    {customers.map((c, i) => {
                        const avatar = AVATAR_COLORS[i % AVATAR_COLORS.length];
                        const daysStyle = getDebtDaysStyle(c.debitDays);

                        return (
                            <div
                                key={c.id}
                                className="grid grid-cols-[1fr_auto_auto] gap-x-4 items-center py-3 border-b border-gray-100 last:border-b-0 px-1"
                            >
                                {/* Name + avatar */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold ${avatar.bg} ${avatar.text}`}>
                                        {getInitials(c.customerName)}
                                    </div>
                                    <span className="text-sm text-tgray9 truncate">{c.customerName}</span>
                                </div>

                                {/* Debt */}
                                <span className="text-sm text-tgray9 tabular-nums">
                                    {formatThousands(c.debitMoney)}
                                </span>

                                {/* Debit days badge */}
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${daysStyle}`}>
                                    {c.debitDays} ngày
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}