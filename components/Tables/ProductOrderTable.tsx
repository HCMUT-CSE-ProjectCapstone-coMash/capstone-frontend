"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { Product } from "@/types/product";
import { TrashIcon } from "@/public/assets/Icons";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DeleteProductFromProductsOrders, GetProductsOrderById } from "@/api/productsOrder/productsOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

export function ProductOrderTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { productsOrdersId } = useParams();

    const { data, isLoading } = useQuery({
        queryKey: ["productsOrderDetails", productsOrdersId],
        queryFn: () => GetProductsOrderById(productsOrdersId as string),
        enabled: !!productsOrdersId,
    });

    const deleteMutation = useMutation({
        mutationFn: ({ orderId, productId } : { orderId: string, productId: string}) => DeleteProductFromProductsOrders(orderId, productId),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productsOrderDetails", productsOrdersId] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xoá sản phẩm thành công" }));
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Xoá sản phẩm thất bại" }));
        }
    });

    const columns: Column<Product>[] = useMemo(() => [
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
        { title: "Giá nhập", key: "importPrice", render: (row) => <span>{formatThousands(row.importPrice)} VND</span> },
        { title: "Giá bán", key: "salePrice", render: (row) => <span>{formatThousands(row.salePrice)} VND</span> },
        { title: "Trạng thái", key: "status", render: (row) => {
            if (row.status === "Approved") return <span className="text-purple">Nhập thêm</span>;
            if (row.status === "Pending") return <span className="text-pink">Hàng mới</span>;
            return <span>{row.status}</span>;
        }},
        { title: "", key: "id", render: (row) => (
            <button 
                className="text-red-500 hover:text-red-700 transition"
                onClick={() => deleteMutation.mutate({ orderId: productsOrdersId as string, productId: row.id })}
            >
                <TrashIcon width={20} height={20} className=""/>
            </button>
        )},
    ], [deleteMutation, productsOrdersId]);

    const products = data?.products || [];
    const orderName = data?.orderName || "Chi tiết đơn hàng";

    return (

        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-purple text-2xl font-medium">{orderName}</p>
                <button
                    onClick={() => router.back()}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm chờ duyệt
                </button>
            </div>

            <Table 
                columns={columns} 
                data={products} 
                isLoading={isLoading} 
            />
        </div>
    );
}