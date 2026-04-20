"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PromotionType, DiscountType, ProductDiscountItem, ComboDeal, PromotionLevel, CreatePromotionPayload } from "@/types/promotion";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SelectOption } from "@/types/UIType";
import { ProductPromotionForm } from "@/components/Forms/PromotionTypes/ProductPromotionForm";
import { DatePickerInput } from "../FormInputs/DatePickerInput";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreatePromotion, FetchPromotionId } from "@/api/promotions/promotions";
import { OrderPromotionForm } from "./PromotionTypes/OrderPromotionForm";
import { ComboPromotionForm } from "./PromotionTypes/ComoboPromotionForm";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";

// ── Options ────────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
    { label: "KM sản phẩm", value: "Product" },
    { label: "KM combo", value: "Combo" },
    { label: "KM đơn hàng", value: "Order" },
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
    discountType: "Percent",
    discountValue: 0,
    maxDiscount: undefined,
});

const initialFormState: FormState = {
    promotionName: "",
    promtionType: "Product",
    startDate: "",
    endDate: "",
    description: "",
    discountType: "Percent",

    productDiscounts: [],
    combos: [],
    levels: [emptyLevel()],
};

// ── Build payload (narrows FormState → Promotion) ─────────────────────────────

function buildPayload(form: FormState): CreatePromotionPayload {
    const base = {
        promotionName: form.promotionName,
        startDate: form.startDate,
        endDate: form.endDate,
        description: form.description,
    };

    switch (form.promtionType) {
        case "Product":
            return {
                promotionType: "Product",
                ...base,
                productDiscounts: form.productDiscounts,
            };
        case "Combo":
            return {
                promotionType: "Combo",
                ...base,
                combos: form.combos,
            };
        case "Order":
            return {
                promotionType: "Order",
                ...base,
                levels: form.levels,
            };
    }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function CreatePromotionForm() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const queryClient = useQueryClient();

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

    const CreateMutation = useMutation({
        mutationFn: ({ payload, userId} : { payload: CreatePromotionPayload, userId: string }) => CreatePromotion(payload, userId),
        onSuccess: (data) => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Tạo khuyến mãi ${data.promotionName} thành công` }));
            setForm(initialFormState);
            queryClient.invalidateQueries({ queryKey: ["fetchPromotionId"] });
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Tạo khuyến mãi thất bại, vui lòng thử lại" }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.id) return;

        if (!form.promotionName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên khuyến mãi" }));
            return;
        }

        if (!form.startDate) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn ngày bắt đầu" }));
            return;
        }

        if (!form.endDate) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn ngày kết thúc" }));
            return;
        }

        if (new Date(form.startDate) >= new Date(form.endDate)) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Ngày kết thúc phải sau ngày bắt đầu" }));
            return;
        }

        if (form.promtionType === "Product" && form.productDiscounts.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm ít nhất một sản phẩm áp dụng" }));
            return;
        }

        if (form.promtionType === "Combo" && form.combos.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm ít nhất một combo áp dụng" }));
            return;
        }

        if (form.promtionType === "Order" && form.levels.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm ít nhất một mức khuyến mãi" }));
            return;
        }

        const payload = buildPayload(form);

        CreateMutation.mutate({ payload, userId: user.id });
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

            {/* Product */}
            {form.promtionType === "Product" && (  
                <ProductPromotionForm 
                    productDiscounts={form.productDiscounts}
                    onChange={(productDiscounts) => setField("productDiscounts", productDiscounts)}
                />
            )}

            {/* Combo */}
            {form.promtionType === "Combo" && (
                <ComboPromotionForm
                    combos={form.combos}
                    onChange={(combos) => setField("combos", combos)}
                />
            )}

            {/* Order */}
            {form.promtionType === "Order" && (
                <OrderPromotionForm
                    levels={form.levels}
                    onChange={(levels) => setField("levels", levels)}
                />
            )}

            {/* ── Actions ───────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-purple text-purple hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Huỷ
                </button>
                <button
                    type="submit"
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-purple text-white hover:bg-purple/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={CreateMutation.isPending}
                >
                    {CreateMutation.isPending ? "Đang tạo..." : "Tạo khuyến mãi"}
                </button>
            </div>
        </form>
    );
}