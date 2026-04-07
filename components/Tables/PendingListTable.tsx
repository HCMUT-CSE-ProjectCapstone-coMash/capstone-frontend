"use client";

import { useRouter } from "next/navigation";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { GetProductsOrdersExcludingPending } from "@/api/productsOrder/productsOrder";
import { ProductsOrderWithCreator } from "@/types/productsOrder";
import { useQuery } from "@tanstack/react-query";
import { OwnerProductsInProductsOrderPageRoute, OwnerProductsOrderHistoryPageRoute } from "@/const/routes";

const statusLabel = (status: ProductsOrderWithCreator["orderStatus"]): string =>
    status === "Sending" ? "Chưa duyệt" : "Đã duyệt";

export function PendingListTable() {
    const router = useRouter();

    const { data: pendingLists = [], isLoading } = useQuery<ProductsOrderWithCreator[]>({
        queryKey: ["productsOrders"],
        queryFn: GetProductsOrdersExcludingPending,
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

    return (
        <div className="mt-8">
            <Table columns={columns} data={pendingLists} isLoading={isLoading} />
        </div>
    );
}
