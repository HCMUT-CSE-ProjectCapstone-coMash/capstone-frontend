"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { Product } from "@/types/product";
import { TrashIcon } from "@/public/assets/Icons";

interface ProductOrderTableProps {
    data: Product[];
    isLoading?: boolean;
    onDelete: (productId: string) => void;
}

export function ProductOrderTable({ data, isLoading = false, onDelete }: ProductOrderTableProps) {

    const columns: Column<Product>[] = [
        { title: "Mã sản phẩm", key: "productId", render: (row) => <span>{row.productId}</span> },
        { title: "Tên sản phẩm", key: "productName", render: (row) => <span>{row.productName}</span> },
        { title: "Số lượng", key: "quantities", render: (row) => {
            if (row.quantityChanges && row.quantityChanges.length > 0) {
                return (
                    <div className="flex flex-col gap-1">
                        {row.quantityChanges.map((change) => (
                            <div key={change.size} className="flex justify-center items-center gap-2 text-sm">
                                <span className="font-medium">{change.size}:</span>
                                <span className="text-red line-through">{change.oldQuantity}</span>
                                <span>→</span>
                                <span className="text-purple font-bold">{change.newQuantity}</span>
                            </div>
                        ))}
                    </div>
                );
            }

            return (
                <div>
                    {row.quantities.map((quantity) => (
                        <div key={quantity.size} className="flex justify-center items-center gap-2 text-sm">
                            <span className="font-medium">{quantity.size}:</span>
                            <span className="text-purple font-bold">{quantity.quantities}</span>
                        </div>
                    ))}
                </div>
            );
        }},
        { title: "Giá nhập", key: "importPrice", render: (row) => <span>N/A</span> }, // Placeholder, add when available
        { title: "Giá bán", key: "sellingPrice", render: (row) => <span>N/A</span> }, // Placeholder, add when available
        { title: "Trạng thái", key: "status", render: (row) => {
            if (row.status === "Approved") {
                return <span className="text-purple">Nhập thêm</span>;
            } else if (row.status === "Pending") {
                return <span className="text-pink">Hàng mới</span>;
            }
            return <span>{row.status}</span>;
        }},
        {
            title: "",
            key: "actions",
            render: (row) => (
                <button
                    type="button"
                    onClick={() => onDelete(row.id)}
                    className="text-red-500 hover:text-red-700 transition"
                >
                    <TrashIcon width={20} height={20} className="" />
                </button>
            ),
        },
    ];

    return (
        <div className="mt-8">
            <Table columns={columns} data={data} isLoading={isLoading} />
        </div>
    );
}