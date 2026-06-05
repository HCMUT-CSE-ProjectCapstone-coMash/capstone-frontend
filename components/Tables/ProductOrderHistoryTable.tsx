"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { Category, Product } from "@/types/product";
import { useParams, useRouter } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { GetProductsOrderById } from "@/api/productsOrder/productsOrder";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProductsOrder } from "@/types/productsOrder";
import { setProductsOrder } from "@/utilities/productsOrderStore";
import Image from "next/image";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { removeDiacritics } from "@/utilities/removeDiacritics";
import { useDebounce } from "@/hooks/useDebounce";
import { formatThousands } from "@/utilities/numberFormat";
import { pinkPlaceholder } from "@/const/placeholder";
import { RootState } from "@/utilities/store";
import { addBarcode, removeBarcode } from "@/utilities/barcodeSlice";
import { LayoutModal } from "../Modal/LayoutModal";
import { BarcodeForm } from "../Forms/BarcodeForm";
import { FetchAllCategories } from "@/api/products/products";
import { Select } from "antd";

export function ProductOrderHistoryTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { productsOrdersId } = useParams();

    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [orderQuery, categoriesQuery] = useQueries({
        queries: [
            {
                queryKey: ["productsOrderDetails", productsOrdersId],
                queryFn: () => GetProductsOrderById(productsOrdersId as string),
                enabled: !!productsOrdersId,
            },
            {
                queryKey: ["categories"],
                queryFn: () => FetchAllCategories(),
                refetchOnWindowFocus: false,
            },
        ],
    });
    
    const { data, isLoading } = orderQuery;
    
    const categoryOptions = [
        { label: "Xem tất cả", value: "" },
        ...(categoriesQuery.data ?? []).map((c: Category) => ({
            label: c.categoryName,
            value: c.categoryName,
        }))
    ];

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

    const [isModalOpen, setModalOpen] = useState(false);
    const barcodeEntries = useSelector((state: RootState) => state.barcode.entries);

    const isProductSelected = useCallback((product: Product): boolean => {
        return barcodeEntries.some((entry) => entry.id === product.id);
    }, [barcodeEntries]);
    
    const handleToggle = useCallback((product: Product) => {
        if (isProductSelected(product)) {
            dispatch(removeBarcode({ id: product.id }));
        } else {
            dispatch(addBarcode({
                id: product.id,
                productId: product.productId,
                productName: product.productName,
                category: product.category,
                color: product.color,
                pattern: product.pattern,
                salePrice: product.salePrice,
                quantities: product.quantities,
                imageUrl: product.imageURL,
                printQuantities: {},
            }));
        }
    }, [dispatch, isProductSelected]);

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
        { title: "In mã", key: "id", render:(row) => (
            <input 
                type="checkbox" 
                checked={isProductSelected(row)}
                onChange={() => handleToggle(row)}
                className="w-4 h-4 accent-purple cursor-pointer"
            />
        )}
    ], [handleToggle, isProductSelected]);

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

            <div className="flex items-center justify-between">
                <div className="flex gap-2 items-center">
                    <Select
                        value={selectedCategory}
                        onChange={(value) => setSelectedCategory(value)}
                        options={categoryOptions}
                        className="w-48 h-11"
                        placeholder="Danh mục"
                    />

                    <NormalSearchInput
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm theo tên sản phẩm"
                        className="w-2xs"
                    />
                </div>

                <button
                    className="py-2 px-4 rounded-lg border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/90 hover:cursor-pointer"
                    onClick={() => setModalOpen(true)}
                >
                    In mã vạch sản phẩm
                </button>
            </div>

            <Table columns={columns} data={filteredProducts} isLoading={isLoading}/>

            <LayoutModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
            >
                <BarcodeForm onClose={() => setModalOpen(false)}/>
            </LayoutModal>
        </div>
    );
}