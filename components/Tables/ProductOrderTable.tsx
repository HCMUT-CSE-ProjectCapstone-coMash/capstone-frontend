"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { Product, UpdateProduct } from "@/types/product";
import { TrashIcon } from "@/public/assets/Icons";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApproveProductsOrder, DeleteProductFromProductsOrders, DeleteProductsOrder, GetProductsOrderById } from "@/api/productsOrder/productsOrder";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { clearEditingProduct, setEditingProduct } from "@/utilities/productEditStore";
import { ProductsOrder } from "@/types/productsOrder";
import { setProductsOrder } from "@/utilities/productsOrderStore";
import { RootState } from "@/utilities/store";
import { UpdateProductInProductsOrderForm } from "../Forms/UpdateProductInProductsOrderForm";
import Image from "next/image";
import { Cell } from "../Cell";
import { OwnerUpdateProductInProductsOrder } from "@/api/products/products";

export function ProductOrderTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const { productsOrdersId } = useParams();
    const editProduct = useSelector((state: RootState) => state.productEdit.editingProduct);

    const { data, isLoading } = useQuery({
        queryKey: ["productsOrderDetails", productsOrdersId],
        queryFn: () => GetProductsOrderById(productsOrdersId as string),
        enabled: !!productsOrdersId,
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productsOrderDetails", productsOrdersId] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xoá sản phẩm thành công" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Xoá sản phẩm thất bại" }));
        }
    });

    const updatePriceMutation = useMutation({
        mutationFn: ({productId, data}: {productId: string; data: UpdateProduct;}) => OwnerUpdateProductInProductsOrder(productId, productsOrdersId as string, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productsOrderDetails", productsOrdersId] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật thành công"}));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật thất bại"}));
        }
    });

    const approveMutation = useMutation({
        mutationFn: (orderId: string) => ApproveProductsOrder(orderId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["productsOrderDetails", productsOrdersId] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Duyệt đơn hàng thành công"}));
            router.back();
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Duyệt đơn hàng thất bại"}));
        }
    });
    
    const deleteOrderMutation = useMutation({
        mutationFn: (orderId: string) => DeleteProductsOrder(orderId),
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Không duyệt thành công" }));
            router.back();
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không duyệt thất bại"}));
        }
    });

    const columns: Column<Product>[] = useMemo(() => [
        { title: "Mã sản phẩm", key: "productId", render: (row) => <span>{row.productId}</span> },
        {title: "Hình ảnh", key: "imageUrl", render: (row) => (
            <div className="w-fit mx-auto">
                <Image src={row.imageURL} alt="" width={32} height={32} className="object-cover" unoptimized/>
            </div>
        )},
        { title: "Tên sản phẩm", key: "productName", render: (row) => (
            <button onClick={() => dispatch(setEditingProduct(row))}>
                {row.productName}
            </button>
        )},
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
        { title: "Giá nhập", key: "importPrice", render: (row) => 
            <Cell
                value={row.importPrice}
                onSave={(newValue) =>
                    updatePriceMutation.mutate({
                        productId: row.id,
                        data: { importPrice: newValue }
                    })
                }
            />
        },
        { title: "Giá bán", key: "salePrice", render: (row) => 
            <Cell
                value={row.salePrice}
                onSave={(newValue) =>
                    updatePriceMutation.mutate({
                        productId: row.id,
                        data: { salePrice: newValue }
                    })
                }
            />
        },
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
    ], [dispatch, deleteMutation, productsOrdersId, updatePriceMutation]);

    const products: Product[] = data?.products || [];
    const orderName = data?.orderName || "Chi tiết đơn hàng";

    const currentIndex = products.findIndex((p) => p.id === editProduct?.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < products.length - 1;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-purple text-2xl font-medium">{orderName}</p>
                <button
                    onClick={() => editProduct ? dispatch(clearEditingProduct()) : router.back()}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm chờ duyệt
                </button>
            </div>

            {editProduct ? (
                <div className="flex flex-col gap-4">
                    <UpdateProductInProductsOrderForm editProduct={editProduct}/>
                    <div className="flex items-center justify-between w-1/6 ml-auto">
                        <button
                            onClick={() => dispatch(setEditingProduct(products[currentIndex - 1]))}
                            disabled={!hasPrev}
                            className={`py-2 px-4 rounded-lg border border-purple text-purple text-sm font-medium transition
                                ${hasPrev ? "hover:bg-purple/5 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                        >
                            ← Trước
                        </button>
                        <span className="text-sm text-gray-500">{currentIndex + 1} / {products.length}</span>
                        <button
                            onClick={() => dispatch(setEditingProduct(products[currentIndex + 1]))}
                            disabled={!hasNext}
                            className={`py-2 px-4 rounded-lg border border-purple text-purple text-sm font-medium transition
                                ${hasNext ? "hover:bg-purple/5 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                        >
                            Sau →
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-4 bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => approveMutation.mutate(productsOrdersId as string)}
                                disabled={approveMutation.isPending}
                                className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer disabled:opacity-50"
                            >
                                {approveMutation.isPending ? "Đang duyệt..." : "Duyệt"}
                            </button>
                            <button
                                onClick={() => deleteOrderMutation.mutate(productsOrdersId as string)}
                                disabled={deleteOrderMutation.isPending}
                                className="py-2 px-4 rounded-lg border border-red-500 bg-red text-white text-sm font-medium transition hover:bg-red-600 disabled:opacity-50"
                            >
                                {deleteOrderMutation.isPending ? "Đang xử lý..." : "Không duyệt"}
                            </button>
                        </div>
                    </div>
                    <Table columns={columns} data={products} isLoading={isLoading}/>
                </>
            )}
        </div>
    );
}