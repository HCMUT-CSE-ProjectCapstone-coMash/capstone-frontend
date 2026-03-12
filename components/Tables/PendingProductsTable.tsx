"use client";

import { Product } from "@/types/product";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { useQuery } from "@tanstack/react-query";
import { GetPendingProducts } from "@/api/products/products";
import { PencilIcon } from "@/public/assets/Icons";
import { useDispatch } from "react-redux";
import { setEditingProduct } from "@/utilities/productEditStore";

export function PendingProductsTable() {
    const dispatch = useDispatch();

    // Lấy dữ liệu sản phẩm đang chờ duyệt
    const { data = [], isLoading } = useQuery({
        queryKey: ["pendingProducts"],
        queryFn: GetPendingProducts,
    });

    const columns: Column<Product>[] = [
        { title: "Mã sản phẩm", key: "productID", render: (row) => <span>{row.productID}</span> },
        { title: "Tên sản phẩm", key: "productName", render: (row) => <span>{row.productName}</span> },
        { title: "Phân loại", key: "category", render: (row) => <span>{row.category}</span> },
        { title: "Màu sắc", key: "color", render: (row) => <span>{row.color}</span> },
        { title: "Họa tiết", key: "pattern", render: (row) => <span>{row.pattern ? row.pattern : "Không"}</span> },
        { title: "", key: "edit", render: (row) => (
            <button 
                className="cursor-pointer"
                onClick={() => {
                    dispatch(setEditingProduct(row));
                }}
            >
                <PencilIcon width={24} height={24} className={"text-pink"}/>
            </button>
        )}
    ];

    return (
        <>
            <Table 
                columns={columns} 
                data={data}
                isLoading={isLoading}
            />

            <div className="flex justify-end mt-5">
                <button
                    className={`py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer`}
                    disabled={data.length === 0}
                >
                    Yêu cầu duyệt
                </button>
            </div>
        </>
    );
}