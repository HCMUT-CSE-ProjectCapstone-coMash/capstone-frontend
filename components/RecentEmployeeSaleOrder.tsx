"use client";

import { FetchRecentCreatedSaleOrderByEmployeeId } from "@/api/saleOrders/saleOrders";
import { SaleOrderResponse } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { RootState } from "@/utilities/store";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { ClockIcon, UserIcon } from "@/public/assets/Icons";
import { formatTime } from "@/utilities/timeFormat";

export function RecentEmployeeSaleOrder() {
    const user = useSelector((state: RootState) => state.user);

    const { data, isLoading } = useQuery<SaleOrderResponse[]>({
        queryKey: ["recent-employee-sale-orders", user.id],
        queryFn: () => FetchRecentCreatedSaleOrderByEmployeeId(user.id!),
        enabled: !!user.id,
        staleTime: 5 * 60 * 1000,
    });

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <ClockIcon width={16} height={16} className="text-tgray5" />
                <p className="text-sm font-semibold text-tgray9">Đơn hàng gần đây</p>
            </div>

            {/* Sub-header */}
            <div className="flex items-center gap-2 mb-4">
                    <UserIcon width={16} height={16} className=""/>
                <span className="text-xs font-medium text-purple bg-light-purple/20 px-2 py-0.5 rounded-full">
                    Của tôi
                </span>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100">
                            <div className="flex flex-col gap-1.5">
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                                <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
                                <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : !data?.length ? (
                <p className="text-sm text-tgray5 text-center py-8">Chưa có đơn hàng nào hôm nay.</p>
            ) : (
                <div className="flex flex-col">
                    {data.map((order, i) => (
                        <div
                            key={order.id}
                            className={`flex items-center justify-between py-3 ${
                                i < data.length - 1 ? "border-b border-gray-100" : ""
                            }`}
                        >
                            <div>
                                <p className="text-sm font-semibold text-purple">#{order.saleOrderId}</p>
                                <p className="text-xs text-tgray5 mt-0.5">
                                    {formatTime(order.createdAt)}
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <p className="text-sm font-semibold text-tgray9">
                                    {formatThousands(order.totalPrice)}{" "}
                                    <span className="text-xs font-normal text-tgray5">VNĐ</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}