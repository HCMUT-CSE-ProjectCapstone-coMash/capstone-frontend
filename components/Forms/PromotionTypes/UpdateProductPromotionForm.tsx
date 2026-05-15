"use client";

import { ProductDiscountItem, ProductPromotion, UpdateProductPromotionPayload } from "@/types/promotion"
import { useMemo, useState } from "react";
import { SelectedProductsTable } from "@/components/Tables/Promotions/SelectedProductsTable";
import { Product, ProductWithOrderStatus } from "@/types/product";
import { SearchInput } from "@/components/FormInputs/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { FetchApprovedProductByName } from "@/api/products/products";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { SharedPromotionFields } from "./SharedPromotionFields";
import { UpdateProductPromotion } from "@/api/promotions/promotions";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { RootState } from "@/utilities/store";
import { pinkPlaceholder } from "@/const/placeholder";

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
    const user = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

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

    // -- Dirty check ────────────────────────────────────────────────────────────────
    const isDirty = useMemo(() => {
        if (formState.promotionName !== promotion.promotionName) return true;
        if (formState.startDate !== promotion.startDate) return true;
        if (formState.endDate !== promotion.endDate) return true;
        if (formState.description !== promotion.description) return true;

        // Deep compare product discounts (only the fields the backend cares about)
        const currentItems = formState.productDiscounts.map((i) => ({
            id: i.product.id,
            type: i.discountType,
            value: i.discountValue,
        }));
        
        const originalItems = promotion.productDiscounts.map((i) => ({
            id: i.product.id,
            type: i.discountType,
            value: i.discountValue,
        }));

        return JSON.stringify(currentItems) !== JSON.stringify(originalItems);
    }, [formState, promotion]);

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

    // -- Submit handler ────────────────────────────────────────────────────────────────

    const toPayload = (state: FormState): UpdateProductPromotionPayload => ({
        promotionName: state.promotionName,
        startDate: state.startDate,
        endDate: state.endDate,
        description: state.description,
        productDiscounts: state.productDiscounts.map((item) => ({
            productId: item.product.id,
            discountType: item.discountType,
            discountValue: item.discountValue,
        })),
    });

    const updateMutation = useMutation({
        mutationFn: ({ promotionId, payload }: { promotionId: string, payload: UpdateProductPromotionPayload }) => UpdateProductPromotion(promotionId, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["promotion", promotion.id] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Cập nhật khuyến mãi ${data.promotionName} thành công` }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật khuyến mãi thất bại. Vui lòng thử lại." }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.promotionName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên khuyến mãi" }));
            return;
        }

        if (!formState.startDate) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn ngày bắt đầu" }));
            return;
        }

        if (!formState.endDate) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn ngày kết thúc" }));
            return;
        }

        if (new Date(formState.startDate) >= new Date(formState.endDate)) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Ngày kết thúc phải sau ngày bắt đầu" }));
            return;
        }

        if (formState.productDiscounts.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm ít nhất một sản phẩm áp dụng" }));
            return;
        }

        const missingDiscount = formState.productDiscounts.filter(
            (item) => !item.discountValue || item.discountValue <= 0
        );

        if (missingDiscount.length > 0) {
            const names = missingDiscount.map((item) => item.product.productName).join(", ");
            dispatch(addAlert({ type: AlertType.WARNING, message: `Vui lòng nhập giá trị giảm cho ${names}` }));
            return;
        }

        const payload = toPayload(formState);

        updateMutation.mutate({ promotionId: promotion.id, payload });
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <form
            className="py-10 flex flex-col gap-6"
            onSubmit={handleSubmit}
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
                                        <Image src={item.data.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} fill alt="" className="object-cover" unoptimized/>
                                    </div>
                                    <span>{item.label}</span>
                                </div>

                                {item.data.isInPendingOrder && <p className="text-sm text-pink">Đang chờ duyệt</p>}
                            </div>
                        )}
                        disabled={promotion.promotionPhase !== "Upcoming" || user.role !== "owner"}
                    />
                </div>
            </div>

            <SelectedProductsTable
                productDiscounts={formState.productDiscounts}
                onUpdate={updateProduct}
                onRemove={removeProduct}
                isEditable={promotion.promotionPhase === "Upcoming" && user.role === "owner"}
            />

            {promotion.promotionPhase === "Upcoming" && user.role === "owner" && (
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-purple text-white font-medium px-4 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple/80 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isDirty || updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật khuyến mãi"}
                    </button>
                </div>
            )}
        </form>
    )
}