"use client";

import { FetchProducts } from "@/api/products/products";
import { OwnerProductsOrderPageRoute } from "@/const/routes";
import { Product } from "@/types/product";
import { Column } from "@/types/UIType";
import { formatThousands } from "@/utilities/numberFormat";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Table } from "./Table";
import { useCallback, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { RootState } from "@/utilities/store";
import Image from "next/image";
import { addBarcode, removeBarcode } from "@/utilities/barcodeSlice";
import { useDebounce } from "@/hooks/useDebounce";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { LayoutModal } from "../Modal/LayoutModal";
import { BarcodeForm } from "../Forms/BarcodeForm";

export function ProductsTable() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const [isModalOpen, setModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [selectedCategory, setSelectedCategory] = useState<string>("");

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

    const { data, isLoading } = useQuery({
        queryKey: ["products", currentPage, selectedCategory, effectiveSearch],
        queryFn: () => FetchProducts(currentPage, pageSize, selectedCategory, effectiveSearch),
    });

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

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const categories = [
        { label: "Xem tất cả", value: "" },
        { label: "Áo", value: "Áo" },
        { label: "Quần", value: "Quần" },
        { label: "Đầm", value: "Đầm" },
        { label: "Váy", value: "Váy" },
    ];

    const isEmployee = user.role === "employee";

    const columns: Column<Product>[] = useMemo(() => {
        const cols: Column<Product>[] = [
            { title: "Mã sản phẩm", key: "productId", render: (row) => <span>{row.productId}</span> },
            {title: "Hình ảnh", key: "imageUrl", render: (row) => (
                <div className="relative w-20 h-20 mx-auto">
                    <Image src={row.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
                </div>
            )},
            { title: "Tên sản phẩm", key: "productName", render: (row) => (
                isEmployee 
                    ? <span>{row.productName}</span> 
                    : <button onClick={() => dispatch(setOwnerEditingProduct(row))}>{row.productName}</button>
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
            )}
        ];

        if (!isEmployee) {
            cols.push({ title: "Giá nhập", key: "importPrice", render: (row) => <span>{formatThousands(row.importPrice)} VND</span> })
        }

        cols.push(
            { title: "Giá bán", key: "salePrice", render: (row) => <span>{formatThousands(row.salePrice)} VND</span> },
            { title: "In mã", key: "id", render: (row) => (
                <input
                    type="checkbox"
                    checked={isProductSelected(row)}
                    onChange={() => handleToggle(row)}
                    className="w-4 h-4 accent-purple cursor-pointer"
                />
            )}
        );

        return cols;
    }, [dispatch, handleToggle, isProductSelected, isEmployee]);

    const products = data?.items ?? [];
    const total = data?.total ?? 0;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-purple text-2xl font-medium">Danh sách sản phẩm</p>
                {!isEmployee && (
                    <button
                        onClick={() => router.push(OwnerProductsOrderPageRoute)}
                        className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                    >
                        Danh sách sản phẩm chờ duyệt
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => handleCategoryChange(cat.value)}
                            className={`py-2 px-4 rounded-lg border border-pink text-sm font-medium transition hover:cursor-pointer ${
                                selectedCategory === cat.value ? "bg-pink text-white" : "bg-white text-pink hover:bg-purple/5"}`}
                        >
                            {cat.label}
                        </button>
                    ))}

                    <NormalSearchInput 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder={"Tìm kiếm theo tên sản phẩm"}
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

            <LayoutModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
            >
                <BarcodeForm onClose={() => setModalOpen(false)}/>
            </LayoutModal>
        </div>
    );
}