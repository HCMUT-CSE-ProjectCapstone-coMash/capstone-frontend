"use client";

import { FetchProducts } from "@/api/products/products";
import { OwnerProductsOrderPageRoute } from "@/const/routes";
import { Product } from "@/types/product";
import { Column } from "@/types/UIType";
import { formatThousands } from "@/utilities/numberFormat";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Table } from "./Table";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { RootState } from "@/utilities/store";
import { toggleProductId } from "@/utilities/printStore";

export function ProductsTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const selectedIds = useSelector((state: RootState) => state.print.selectedIds);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const { data, isLoading } = useQuery({
        queryKey: ["products", currentPage],
        queryFn: () => FetchProducts(currentPage, pageSize),
    });

    const columns: Column<Product>[] = useMemo(() => [
        { title: "Mã sản phẩm", key: "productId", render: (row) => <span>{row.productId}</span> },
        { title: "Tên sản phẩm", key: "productName", render: (row) => (
            <button onClick={() => dispatch(setOwnerEditingProduct(row))}>{row.productName}</button>
        )},
        { title: "Phân loại", key: "category", render: (row) => <span>{row.category}</span> },
        { title: "Màu sắc", key: "color", render: (row) => <span>{row.color}</span> },
        { title: "Họa tiết", key: "pattern", render: (row) => <span>{row.pattern || "Không"}</span> },
        { title: "Số lượng", key: "quantities", render: (row) => (
            <>
                {row.quantities.map((quantity) => (
                    <div key={quantity.size} className="flex justify-center items-center gap-2 text-sm">
                        <span className="font-medium">{quantity.size}:</span>
                        <span className="text-purple font-bold">{quantity.quantities}</span>
                    </div>
                ))}
            </>
        )},
        { title: "Giá nhập", key: "importPrice", render: (row) => <span>{formatThousands(row.importPrice)} VND</span> },
        { title: "Giá bán", key: "salePrice", render: (row) => <span>{formatThousands(row.salePrice)} VND</span> },
        { title: "In mã", key: "id", render: (row) => (
            <input
                type="checkbox"
                checked={selectedIds.includes(row.id)}
                onChange={() => dispatch(toggleProductId(row.id))}
                className="w-4 h-4 accent-purple cursor-pointer"
            />
        )},
    ], [dispatch, selectedIds]);

    const products = data?.items ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-purple text-2xl font-medium">Danh sách sản phẩm</p>
                <button
                    onClick={() => router.push(OwnerProductsOrderPageRoute)}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm chờ duyệt
                </button>
            </div>

            <Table
                columns={columns}
                data={products}
                isLoading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    onChange: setCurrentPage,
                }}
            />
        </div>
    )
}