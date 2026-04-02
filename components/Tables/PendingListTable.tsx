"use client";

import { useState } from "react";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { GetProductsOrdersExcludingPending, PatchOrderAndStatus } from "@/api/productsOrder/productsOrder";
import { ProductsOrder } from "@/types/productsOrder";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const statusLabel = (status: ProductsOrder["orderStatus"]): string =>
    status === "Sending" ? "Chưa duyệt" : "Đã duyệt";

export function PendingListTable() {
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data: pendingLists = [], isLoading } = useQuery<ProductsOrder[]>({
        queryKey: ["productsOrders"],
        queryFn: GetProductsOrdersExcludingPending,
    });

    const approveMutation = useMutation({
        mutationFn: (orderId: string) => PatchOrderAndStatus(orderId, { orderStatus: "Approved" }),
        onSuccess: (_data, orderId) => {
            queryClient.setQueryData<ProductsOrder[]>(["productsOrders"], (current) =>
                current?.map((item) =>
                    item.id === orderId ? { ...item, orderStatus: "Approved" } : item
                ) ?? []
            );
        },
        onError: () => setError("Cập nhật trạng thái duyệt thất bại"),
    });

    const handleApprove = (id: string) => {
        approveMutation.mutate(id);
    };

    const handleDelete = (id: string) => {
        queryClient.setQueryData<ProductsOrder[]>(["productsOrders"], (current) =>
            current?.filter((item) => item.id !== id) ?? []
        );
    };

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
                            onClick={() => handleApprove(row.id)}
                            className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                        >
                            Duyệt
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            className="py-1.5 px-3 rounded-lg bg-red-600 text-white text-sm font-medium transition hover:bg-red-700 hover:cursor-pointer"
                        >
                            Xóa
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
