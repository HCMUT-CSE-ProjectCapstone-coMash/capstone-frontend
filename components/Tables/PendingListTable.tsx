"use client";

import { useRouter } from "next/navigation";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { GetProductsOrdersExcludingPending } from "@/api/productsOrder/productsOrder";
import { ProductsOrderWithCreator } from "@/types/productsOrder";
import { useQuery } from "@tanstack/react-query";
import { OwnerProductsInProductsOrderPageRoute, OwnerProductsOrderHistoryPageRoute } from "@/const/routes";
import { useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";

const statusLabel = (status: ProductsOrderWithCreator["orderStatus"]): string =>
    status === "Sending" ? "Chưa duyệt" : "Đã duyệt";

export function PendingListTable() {
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

    const { data, isLoading } = useQuery({
        queryKey: ["productsOrders", currentPage, pageSize, effectiveSearch],
        queryFn: () => GetProductsOrdersExcludingPending(currentPage, pageSize, effectiveSearch),
    });

    const columns: Column<ProductsOrderWithCreator>[] = [
        { title: "Tên danh sách", key: "orderName", render: (row) => <span>{row.orderName}</span> },
        { title: "Nhân viên tạo", key: "createdByName", render: (row) => <span>{row.createdByName || row.createdBy}</span> },
        { title: "Mô tả", key: "orderDescription", render: (row) => <span>{row.orderDescription}</span> },
        { title: "Tình trạng", key: "orderStatus", render: (row) => <span>{statusLabel(row.orderStatus)}</span> },
        {
            title: "",
            key: "actions",
            render: (row) =>
                row.orderStatus === "Sending" ? (
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.push(OwnerProductsInProductsOrderPageRoute(row.id))}
                            className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                        >
                            Xem
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => router.push(OwnerProductsOrderHistoryPageRoute(row.id))}
                            className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                        >
                            Xem lịch sử
                        </button>
                    </div>
                ),
        },
    ];

    const pendingLists = data?.items ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="">
            <div className="flex items-center justify-between mb-5">
                <p className="text-purple text-3xl font-medium">Danh sách chờ duyệt</p>
                <div className="flex flex-column gap-5">
                    <NormalSearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo tên danh sách"
                        className="w-xs"
                    />

                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                    >
                        Danh sách sản phẩm
                    </button>
                </div>

            </div>

            <Table 
                columns={columns} 
                data={pendingLists} 
                isLoading={isLoading} 
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
