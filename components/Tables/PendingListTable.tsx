"use client";

import { useEffect, useState } from "react";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { GetProductsOrders, PatchOrderAndStatus } from "@/api/productsOrder/productsOrder";
import { ProductsOrder } from "@/types/productsOrder";

const statusLabel = (status: ProductsOrder["orderStatus"]): string =>
    status === "Pending" ? "Chưa duyệt" : "Đã duyệt";

export function PendingListTable() {
    const [pendingLists, setPendingLists] = useState<ProductsOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const orders = await GetProductsOrders();
                setPendingLists(orders);
            } catch (err) {
                setError("Không thể tải danh sách duyệt");
            } finally {
                setIsLoading(false);
            }
        };

        loadOrders();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await PatchOrderAndStatus(id, { orderStatus: "Approved" });
            setPendingLists((current) =>
                current.map((item) =>
                    item.id === id ? { ...item, orderStatus: "Approved" } : item
                )
            );
        } catch (err) {
            setError("Cập nhật trạng thái duyệt thất bại");
        }
    };

    const handleDelete = (id: string) => {
        setPendingLists((current) => current.filter((item) => item.id !== id));
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
                row.orderStatus === "Pending" ? (
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
