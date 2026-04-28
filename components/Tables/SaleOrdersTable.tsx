"use client";

import { useState } from "react";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { SaleOrderResponse } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { PaymentMethod } from "@/const/PaymentMethod";
import { useQuery } from "@tanstack/react-query";
import { FetchAllSaleOrders } from "@/api/saleOrders.ts/saleOrders";
import { useRouter } from "next/navigation";
import { EmployeeSaleOrdersByIdPageRoute, OwnerSaleOrdersByIdPageRoute } from "@/const/routes";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";

const timeFilters = [
    { label: "Xem tất cả", value: "" },
    { label: "Tháng này", value: "this_month" },
    { label: "Tuần này", value: "this_week" },
    { label: "Hôm qua", value: "yesterday" },
    { label: "Hôm nay", value: "today" },
];

const paymentOptions: { value: string, label: string }[] = [
    { value: PaymentMethod.CASH, label: "Tiền mặt" },
    { value: PaymentMethod.TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.DEBIT, label: "Ghi nợ" }
];

export function SaleOrdersTable() {
    const user = useSelector((state: RootState) => state.user);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [selectedTimeFilter, setSelectedTimeFilter] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

    const handleTimeFilterChange = (filter: string) => {
        setSelectedTimeFilter(filter);
    };

    const router = useRouter();

    const { data, isLoading } = useQuery({
        queryKey: ["saleOrders", selectedTimeFilter, effectiveSearch],
        queryFn: () => FetchAllSaleOrders(currentPage, pageSize, selectedTimeFilter, effectiveSearch)
    });

    const saleOrders = data?.items ?? [];
    const total = data?.total ?? 0;

    const columns: Column<SaleOrderResponse>[] = [
        { title: "Mã đơn hàng", key: "orderId", render: (row) => <span>{row.saleOrderId}</span>},
        { title: "Tên khách hàng", key: "customerName", render: (row) => <span>{row.customerName}</span>},
        { title: "Thời gian xuất", key: "createdAt", render: (row) => <span>{new Date(row.createdAt).toLocaleString()}</span>},
        { title: "Thành tiền", key: "totalAmount", render: (row) => <span>{formatThousands(row.totalPrice)} VNĐ</span>},
        { title: "Lợi nhuận", key: "profit", render: (row) => <span>{formatThousands(row.totalProfit)} VNĐ</span>},
        { title: "Hình thức thanh toán", key: "paymentMethod", render: (row) => (
            <span>
                {paymentOptions.find(opt => opt.value === row.paymentMethod)?.label ?? row.paymentMethod}
            </span>
        )},
        { title: "Số tiền nợ", key: "debtAmount", render: (row) => <span>{formatThousands(row.debitMoney)} VNĐ</span>},
        
        {
            title: "",
            key: "action",
            render: (row) => (
                <button
                    onClick={() => {
                        if (user.role === "owner") {
                            router.push(OwnerSaleOrdersByIdPageRoute(row.id));
                        } else {
                            router.push(EmployeeSaleOrdersByIdPageRoute(row.id));
                        }
                    }}
                    className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/10 hover:cursor-pointer"
                >
                    Xem
                </button>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                {timeFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => handleTimeFilterChange(filter.value)}
                        className={`py-2 px-4 rounded-lg border border-pink text-sm font-medium transition hover:cursor-pointer ${
                            selectedTimeFilter === filter.value ? "bg-pink text-white" : "bg-white text-pink hover:bg-purple/5"}`}
                    >
                        {filter.label}
                    </button>
                ))}

                <NormalSearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo tên khách hàng hoặc mã đơn hàng"
                    className="w-md"
                />
            </div>

            <Table
                columns={columns}
                isLoading={isLoading}
                data={saleOrders}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    onChange: setCurrentPage,
                }}
            />
        </div>
    );
}