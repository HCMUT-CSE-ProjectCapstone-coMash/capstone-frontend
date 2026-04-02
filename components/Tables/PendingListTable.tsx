"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { GetProductsOrdersExcludingPending } from "@/api/productsOrder/productsOrder";
import { ProductsOrder } from "@/types/productsOrder";
import { useQuery } from "@tanstack/react-query";

const statusLabel = (status: ProductsOrder["orderStatus"]): string =>
    status === "Sending" ? "Chưa duyệt" : "Đã duyệt";

export function PendingListTable() {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const { data: pendingLists = [], isLoading } = useQuery<ProductsOrder[]>({
        queryKey: ["productsOrders"],
        queryFn: GetProductsOrdersExcludingPending,
    });

    const columns: Column<ProductsOrder>[] = [
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
                            onClick={() => router.push(`/chu-cua-hang/san-pham/cho-duyet/chi-tiet`)}
                            className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                        >
                            Xem
                        </button>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">&nbsp;</div>
                ),
        },
    ];

    return (
        <div className="mt-8">
            {error ? <p className="text-red-600 mb-4">{error}</p> : null}
            <Table columns={columns} data={pendingLists} isLoading={isLoading} />
        </div>
    );
}
