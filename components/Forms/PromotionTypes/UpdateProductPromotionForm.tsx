"use client";

import { ProductDiscountItem, ProductPromotion } from "@/types/promotion"
import { useState } from "react";
import { SelectedProductsTable } from "@/components/Tables/Promotions/SelectedProductsTable";
import { Product, ProductWithOrderStatus } from "@/types/product";
import { SearchInput } from "@/components/FormInputs/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { FetchApprovedProductByName } from "@/api/products/products";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { SharedPromotionFields } from "./SharedPromotionFields";

interface UpdateProductPromotionFormProps {
    promotion: ProductPromotion
}

interface FormState {
    promotionName: string;
    startDate: string;
    endDate: string;
    description: string;
    productDiscounts: ProductDiscountItem[];
}

export function UpdateProductPromotionForm({ promotion } : UpdateProductPromotionFormProps) {
    const [formState, setFormState] = useState<FormState>({
        promotionName: promotion.promotionName,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        description: promotion.description,
        productDiscounts: promotion.productDiscounts
    });

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    }

    // -- Product search & selection ─────────────────────────────────────────────────

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
        if (formState.productDiscounts.some((p) => p.product.id === product.id)) return;

        const newDiscountItem: ProductDiscountItem = {
            product,
            discountType: "Percent",
            discountValue: 0,
        };

        setField("productDiscounts", [...formState.productDiscounts, newDiscountItem]);
    };

    const updateProduct = (productId: string, patch: Partial<ProductDiscountItem>) => {
        setField("productDiscounts", formState.productDiscounts.map((item) => item.product.id === productId ? { ...item, ...patch } : item));
    };

    const removeProduct = (productId: string) => {
        setField("productDiscounts", formState.productDiscounts.filter((item) => item.product.id !== productId));
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <form
            className="py-10 flex flex-col gap-6"
        >
            <SharedPromotionFields
                promotion={promotion}
                values={formState}
                onChange={setField}
            />

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
                        disabled={promotion.promotionPhase !== "Upcoming"}
                    />
                </div>
            </div>

            <SelectedProductsTable
                productDiscounts={formState.productDiscounts}
                onUpdate={updateProduct}
                onRemove={removeProduct}
                isEditable={promotion.promotionPhase === "Upcoming"}
            />
        </form>
    )
}