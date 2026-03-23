"use client";

import { Product } from "@/types/product";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PencilIcon, TrashIcon } from "@/public/assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import { setEditingProduct } from "@/utilities/productEditStore";
import { DeleteProductFromProductsOrders, FetchOrCreateOrder } from "@/api/productsOrder/productsOrder";
import { RootState } from "@/utilities/store";
import { removeProductFromOrder, setProductsOrder } from "@/utilities/productsOrderStore";
import { useEffect, useState } from "react";
import { ProductsOrder } from "@/types/productsOrder";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { LayoutModal } from "../Modal/LayoutModal";
import { ProductsOrderForm } from "../Forms/ProductsOrderForm";

export function PendingProductsTable() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);
    const [isFormSubmit, setFormSubmit] = useState<boolean>(false);

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

    const deleteMutation = useMutation({
        mutationFn: ({ orderId, productId } : { orderId: string, productId: string}) => DeleteProductFromProductsOrders(orderId, productId),

        onSuccess: (data) => {
            dispatch(removeProductFromOrder(data.productId));
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xoá sản phẩm thành công" }));
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Xoá sản phẩm thất bại" }));
        }
    });

    const products = productsOrder?.products ?? [];

    const columns: Column<Product>[] = [
        { title: "Mã sản phẩm", key: "productId", render: (row) => <span>{row.productId}</span> },
        { title: "Tên sản phẩm", key: "productName", render: (row) => <span>{row.productName}</span> },
        { title: "Số lượng", key: "quantities", render: (row) => (
            <span>{row.quantities.reduce((sum, q) => sum + q.quantities, 0)}</span>
        )},
        { title: "Chỉnh sửa", key: "edit", render: (row) => (
            <button 
                className="cursor-pointer"
                onClick={() => {
                    dispatch(setEditingProduct(row));
                }}
            >
                <PencilIcon width={24} height={24} className={""}/>
            </button>
        )},
        { title: "Xoá", key: "delete", render: (row) => (
            <button
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deleteMutation.isPending}
                onClick={() => {
                    if (productsOrder?.id) {
                        deleteMutation.mutate({ orderId: productsOrder.id, productId: row.id });
                    }
                }}
            >
                <TrashIcon width={24} height={24} className={"text-red-500"}/>
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
                    onClick={() => setFormSubmit(true)}
                >
                    Yêu cầu duyệt
                </button>
            </div>

            <LayoutModal
                isOpen={isFormSubmit}
                onClose={() => setFormSubmit(false)}
            >
                <ProductsOrderForm/>
            </LayoutModal>
        </>
    );
}