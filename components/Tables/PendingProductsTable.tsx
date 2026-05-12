"use client";

import { Product } from "@/types/product";
import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PencilIcon, TrashIcon } from "@/public/assets/Icons";
import { useDispatch, useSelector } from "react-redux";
import { clearEditingProduct, setEditingProduct } from "@/utilities/productEditStore";
import { DeleteProductFromProductsOrders, FetchOrCreateOrder } from "@/api/productsOrder/productsOrder";
import { RootState } from "@/utilities/store";
import { removeProductFromOrder, setProductsOrder } from "@/utilities/productsOrderStore";
import { useEffect, useState } from "react";
import { ProductsOrder } from "@/types/productsOrder";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { LayoutModal } from "../Modal/LayoutModal";
import { ProductsOrderForm } from "../Forms/ProductsOrderForm";
import Image from "next/image";
import { pinkPlaceholder } from "@/const/placeholder";

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
        { title: "Tên sản phẩm", key: "productName", render: (row) => (
            <div className="flex items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                    <Image src={row.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} alt="" fill className="object-cover" unoptimized/>
                </div>
                <p>{row.productName}</p>
            </div>
        ) },
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
        { title: "Chỉnh sửa", key: "edit", render: (row) => (
            <button 
                className="cursor-pointer"
                onClick={() => { dispatch(setEditingProduct(row)) }}
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
                        dispatch(clearEditingProduct());
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