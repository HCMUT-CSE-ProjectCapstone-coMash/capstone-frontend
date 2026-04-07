"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { Product } from "@/types/product";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GetProductsOrderById } from "@/api/productsOrder/productsOrder";
import { useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { ProductsOrder } from "@/types/productsOrder";
import { setProductsOrder } from "@/utilities/productsOrderStore";
import Image from "next/image";

export function ProductOrderHistoryTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { productsOrdersId } = useParams();

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

    const columns: Column<Product>[] = useMemo(() => [
        { title: "Mã sản phẩm", key: "productId", render: (row) => <span>{row.productId}</span> },
        {title: "Hình ảnh", key: "imageUrl", render: (row) => (
            <div className="w-fit mx-auto">
                <Image src={row.imageURL} alt="" width={32} height={32} className="object-cover" unoptimized/>
            </div>
        )},
        { title: "Tên sản phẩm", key: "productName", render: (row) => (<span>{row.productName}</span>)},
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
        { title: "Giá nhập", key: "importPrice", render: (row) => <span>{row.importPrice}</span>},
        { title: "Giá bán", key: "salePrice", render: (row) => <span>{row.salePrice}</span>},
        { title: "Trạng thái", key: "status", render: (row) => {
            if (row.status === "Approved") return <span className="text-purple">Nhập thêm</span>;
            if (row.status === "Pending") return <span className="text-pink">Hàng mới</span>;
            return <span>{row.status}</span>;
        }},
    ], [dispatch, productsOrdersId]);

    const products: Product[] = data?.products || [];
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
            <div className="flex flex-col gap-4 bg-white py-4 sm:flex-row sm:items-center sm:justify-between">
                {/* thanh filter va search */}
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="h-11 min-w-[160px] flex-1 rounded-lg border border-gray-200 bg-gray-50" />
                    <div className="h-11 min-w-[160px] flex-1 rounded-lg border border-gray-200 bg-gray-50" />
                </div>
            </div>
            <Table columns={columns} data={products} isLoading={isLoading}/>
        </div>
    );
}