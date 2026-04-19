"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromotionType, DiscountType, ProductDiscountItem, ComboDeal, PromotionLevel, ProductPromotion, ComboPromotion, OrderPromotion } from "@/types/promotion";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SelectOption } from "@/types/UIType";
import { ProductPromotionForm } from "@/components/Forms/PromotionTypes/ProductPromotionForm";
import { DatePickerInput } from "../FormInputs/DatePickerInput";
import { useQuery } from "@tanstack/react-query";
import { FetchPromotionId } from "@/api/promotions/promotions";
import { OrderPromotionForm } from "./PromotionTypes/OrderPromotionForm";
import { ComboPromotionForm } from "./PromotionTypes/ComoboPromotionForm";

// ── Options ────────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
    { label: "KM sản phẩm", value: "PRODUCT" },
    { label: "KM combo", value: "COMBO" },
    { label: "KM đơn hàng", value: "ORDER" },
];

// ── Form state type ───────────────────────────────────────────────────────────
// Holds shared fields + all branch-specific fields so users don't lose data
// when toggling promotionType. On submit we narrow to the correct variant.

interface FormState {
    promotionName: string,
    promtionType: PromotionType,
    startDate: string,
    endDate: string,
    description: string,
    discountType: DiscountType,

    productDiscounts: ProductDiscountItem[],
    combos: ComboDeal[],
    levels: PromotionLevel[],
}

const emptyLevel = (): PromotionLevel => ({
    minValue: 0,
    discountType: "PERCENT",
    discountValue: 0,
    maxDiscount: undefined,
});

const initialFormState: FormState = {
    promotionName: "",
    promtionType: "PRODUCT",
    startDate: "",
    endDate: "",
    description: "",
    discountType: "PERCENT",

    productDiscounts: [],
    combos: [],
    levels: [emptyLevel()],
};

// ── Build payload (narrows FormState → Promotion) ─────────────────────────────

type CreatePromotionPayload =
    | Omit<ProductPromotion, "id" | "isActive" | "createdAt">
    | Omit<ComboPromotion, "id" | "isActive" | "createdAt">
    | Omit<OrderPromotion, "id" | "isActive" | "createdAt">;

function buildPayload(form: FormState, promotionId: string): CreatePromotionPayload {
    const base = {
        promotionId,
        promotionName: form.promotionName,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
    };

    switch (form.promtionType) {
        case "PRODUCT":
            return {
                ...base,
                promotionType: "PRODUCT",
                productDiscounts: form.productDiscounts,
            };
        case "COMBO":
            return {
                ...base,
                promotionType: "COMBO",
                combos: form.combos,
            };
        case "ORDER":
            return {
                ...base,
                promotionType: "ORDER",
                levels: form.levels,
            };
    }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CreatePromotionForm() {
    const router = useRouter();

    // Base fields
    const [form, setForm] = useState<FormState>(initialFormState);
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const { data } = useQuery({
        queryKey: ["fetchPromotionId"],
        queryFn: FetchPromotionId,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
    
    const promotionId = data?.promotionId ?? "";

    const handlePromotionTypeChange = (newType: PromotionType) => {
        setForm((prev) => ({
            ...prev,
            promtionType: newType,
            productDiscounts: [],
            combos: [],
            levels: [emptyLevel()],
        }));
    };

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload = buildPayload(form, promotionId);
        console.log("Submitting:", payload);

    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <form 
            className="py-10 flex flex-col gap-6"
            onSubmit={handleSubmit}
        >
            {/* Tên khuyến mãi + Mã khuyến mãi */}
            <div className="grid grid-cols-2 gap-6">
                <TextInput
                    label="Mã khuyến mãi"
                    value={promotionId}
                    placeHolder=""
                    onChange={() => {}}
                    disabled={true}
                />

                <TextInput
                    label="Tên khuyến mãi"
                    value={form.promotionName}
                    placeHolder="Nhập tên khuyến mãi"
                    onChange={(e) => setField("promotionName" ,e.target.value)}
                />
            </div>

            {/* Phân loại + Ngày bắt đầu + Ngày kết thúc */}
            <div className="grid grid-cols-3 gap-6">
                <SelectInput
                    label="Phân loại"
                    value={form.promtionType}
                    onChange={(value) => handlePromotionTypeChange(value as PromotionType)}
                    options={PROMOTION_TYPE_OPTIONS}
                />

                <DatePickerInput
                    label="Ngày bắt đầu"
                    value={form.startDate}
                    placeHolder="Chọn ngày bắt đầu"
                    onChange={(date) => setField("startDate", date)}
                />

                <DatePickerInput
                    label="Ngày kết thúc"
                    value={form.endDate}
                    placeHolder="Chọn ngày kết thúc"
                    onChange={(date) => setField("endDate", date)}
                />
            </div>

            {/* Mô tả */}
            <TextInput
                label="Mô tả"
                value={form.description}
                placeHolder="Mô tả (nếu có)"
                inputType="text"
                onChange={(e) => setField("description" ,e.target.value)}
            />

            {/* ── Type-specific ──────────────────────────────────────────────── */}

            {/* PRODUCT */}
            {form.promtionType === "PRODUCT" && (  
                <ProductPromotionForm 
                    productDiscounts={form.productDiscounts}
                    onChange={(productDiscounts) => setField("productDiscounts", productDiscounts)}
                />
            )}

            {/* COMBO */}
            {form.promtionType === "COMBO" && (
                <ComboPromotionForm
                    combos={form.combos}
                    onChange={(combos) => setField("combos", combos)}
                />
            )}

            {/* ORDER */}
            {form.promtionType === "ORDER" && (
                <OrderPromotionForm
                    levels={form.levels}
                    onChange={(levels) => setField("levels", levels)}
                />
            )}

            {/* ── Actions ───────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={() => router.back()}
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-purple text-purple hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Huỷ
                </button>
                <button
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-purple text-white hover:bg-purple/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {"Tạo khuyến mãi"}
                </button>
            </div>
        </form>
    );
}