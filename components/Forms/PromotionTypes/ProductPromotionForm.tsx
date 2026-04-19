"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product, ProductWithOrderStatus } from "@/types/product";
import { ProductDiscountItem } from "@/types/promotion";
import { FetchApprovedProductByName } from "@/api/products/products";
import Image from "next/image";
import { SearchInput } from "@/components/FormInputs/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { SelectedProductsTable } from "../../Tables/Promotions/SelectedProductsTable";

// ── Props ──────────────────────────────────────────────────────────────────────

interface ProductPromotionFormProps {
    productDiscounts: ProductDiscountItem[];
    onChange: (productDiscounts: ProductDiscountItem[]) => void;
}

export function ProductPromotionForm({ productDiscounts, onChange } : ProductPromotionFormProps) {
    const [productCache, setProductCache] = useState<Record<string, Product>>({});

    const [search, setSearch] = useState("");

    const debouncedSearch = useDebounce(search, 500);

    const { data: products = [] } = useQuery({
        queryKey: ["products", debouncedSearch],
        queryFn: () => FetchApprovedProductByName(debouncedSearch),
        enabled: debouncedSearch.length > 2,
        staleTime: 0,
        gcTime: 0
    });

    const suggestions = products.map((p: Product) => ({
        label: p.productName,
        value: p.productName,
        data: p
    }));

    // ── Handlers ───────────────────────────────────────────────────────────────

    const addProduct = (product: Product) => {
        if (productDiscounts.some((p) => p.productId === product.id)) return;

        setProductCache((prev) => ({ ...prev, [product.id]: product }));

        const newDiscountItem: ProductDiscountItem = {
            productId: product.id,
            discountType: "PERCENT",
            discountValue: 0,
        };

        onChange([...productDiscounts, newDiscountItem]);
    };

    const updateProduct = (productId: string, patch: Partial<ProductDiscountItem>) => {
        onChange(productDiscounts.map((item) => item.productId === productId ? { ...item, ...patch } : item));
    };

    const removeProduct = (productId: string) => {
        onChange(productDiscounts.filter((item) => item.productId !== productId));
    }

    // --- Render ───────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-normal text-tgray9">Sản phẩm áp dụng</p>

                <div className="w-md">
                    <SearchInput<ProductWithOrderStatus>
                        label=""
                        placeHolder="Tìm theo tên sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        suggestions={suggestions}
                        isItemDisabled={(item) => item.data.isInPendingOrder}
                        onSuggestionClick={(item) => addProduct(item.data)}
                        renderItem={(item) => (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8">
                                        <Image src={item.data.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} fill alt="" className="object-cover" unoptimized/>
                                    </div>
                                    <span>{item.label}</span>
                                </div>

                                {item.data.isInPendingOrder && <p className="text-sm text-pink">Đang chờ duyệt</p>}
                            </div>
                        )}
                    />
                </div>
            </div>

            {productDiscounts.length > 0 ? (
                <SelectedProductsTable 
                    productDiscounts={productDiscounts} 
                    productCache={productCache}
                    onUpdate={updateProduct}
                    onRemove={removeProduct}
                />
            ) : (
                <div className="rounded-lg border-[0.5px] border-dashed border-tgray5 px-4 py-8 text-center text-sm text-gray-400">
                    Tìm và chọn sản phẩm để áp dụng khuyến mãi
                </div>
            )}
        </div>
    )
}