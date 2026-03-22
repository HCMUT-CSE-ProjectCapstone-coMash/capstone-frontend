"use client";

import { Product } from "@/types/product";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon } from "@/public/assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import { setEditingProduct } from "@/utilities/productEditStore";
import { FetchOrCreateOrder } from "@/api/productsOrder/productsOrder";
import { RootState } from "@/utilities/store";
import { setProductsOrder } from "@/utilities/productsOrderStore";
import { useEffect } from "react";
import { ProductsOrder } from "@/types/productsOrder";

export function PendingProductsTable() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);

    // Lấy dữ liệu sản phẩm đang chờ duyệt
    const { data , isLoading } = useQuery({
        queryKey: ["pendingProducts"],
        queryFn: () => {
            if (user.id) {
                return FetchOrCreateOrder(user.id);
            }
        },
        enabled: productsOrder === null && user.id !== null,
    });

    useEffect(() => {
        if (data) {
            const productsOrder: ProductsOrder = {
                id: data.id,
                createdBy: data.createdBy,
                createdAt: data.createdAt,
                orderName: data.orderName,
                orderDescription: data.orderDescription,
                orderStatus: data.orderStatus,
                products: data.products,
            }
            dispatch(setProductsOrder(productsOrder));
        }
    }, [data, dispatch]);

    const products = productsOrder?.products ?? [];

    const columns: Column<Product>[] = [
        { title: "Mã sản phẩm", key: "productID", render: (row) => <span>{row.productId}</span> },
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
                data={products}
                isLoading={isLoading}
            />

            <div className="flex justify-end mt-5">
                <button
                    className={`py-2 px-3 rounded-lg text-white bg-purple text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                    disabled={products.length === 0}
                >
                    Yêu cầu duyệt
                </button>
            </div>
        </>
    );
}