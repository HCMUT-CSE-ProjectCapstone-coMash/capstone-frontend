"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { Product } from "@/types/product";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GetProductsOrderById } from "@/api/productsOrder/productsOrder";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { ProductsOrder } from "@/types/productsOrder";
import { setProductsOrder } from "@/utilities/productsOrderStore";
import Image from "next/image";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { removeDiacritics } from "@/utilities/removeDiacritics";
import { useDebounce } from "@/hooks/useDebounce";
import { formatThousands } from "@/utilities/numberFormat";
import { pinkPlaceholder } from "@/const/placeholder";

export function ProductOrderHistoryTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { productsOrdersId } = useParams();

    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

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
            <div className="mx-auto relative w-20 h-20">
                <Image src={row.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} fill alt="" className="object-cover" unoptimized/>
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
        { title: "Giá nhập", key: "importPrice", render: (row) => <span>{formatThousands(row.importPrice)} VNĐ</span>},
        { title: "Giá bán", key: "salePrice", render: (row) => <span>{formatThousands(row.salePrice)} VNĐ</span>},
        { title: "Trạng thái", key: "status", render: (row) => {
            if (row.quantityChanges?.length) return <span className="text-purple">Nhập thêm</span>;
            if (!row.quantityChanges?.length) return <span className="text-pink">Hàng mới</span>;
        }},
    ], []);

    const categories = [
        { label: "Xem tất cả", value: "" },
        { label: "Áo", value: "Áo" },
        { label: "Quần", value: "Quần" },
        { label: "Đầm", value: "Đầm" },
        { label: "Váy", value: "Váy" },
    ];

    const products: Product[] = data?.products || [];
    const filteredProducts = products.filter((p) => {
        const matchCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchSearch = debouncedSearch ? removeDiacritics(p.productName.toLowerCase()).includes(removeDiacritics(debouncedSearch.toLowerCase())) : true;
        return matchCategory && matchSearch;
    });

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

            <div className="flex gap-2">
                {categories.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`py-2 px-4 rounded-lg border border-pink text-sm font-medium transition hover:cursor-pointer ${
                            selectedCategory === cat.value ? "bg-pink text-white" : "bg-white text-pink hover:bg-purple/5"}`}
                    >
                        {cat.label}
                    </button>
                ))}
                <NormalSearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo tên sản phẩm"
                    className="w-2xs"
                />
            </div>

            <Table columns={columns} data={filteredProducts} isLoading={isLoading}/>
        </div>
    );
}