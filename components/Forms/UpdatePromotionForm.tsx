import { ComboDeal, ProductDiscountItem, Promotion, PromotionLevel, PromotionType } from "@/types/promotion";
import { TextInput } from "../FormInputs/TextInput";
import { useState } from "react";
import { SelectInput } from "../FormInputs/SelectInput";
import { SelectOption } from "@/types/UIType";
import { DatePickerInput } from "../FormInputs/DatePickerInput";
import { ProductPromotionForm } from "./PromotionTypes/ProductPromotionForm";
import { ComboPromotionForm } from "./PromotionTypes/ComoboPromotionForm";
import { OrderPromotionForm } from "./PromotionTypes/OrderPromotionForm";

const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
    { label: "KM sản phẩm", value: "Product" },
    { label: "KM combo", value: "Combo" },
    { label: "KM đơn hàng", value: "Order" },
];

interface FormState {
    promotionName: string,
    promotionType: PromotionType,
    startDate: string,
    endDate: string,
    description: string,

    productDiscounts: ProductDiscountItem[],
    combos: ComboDeal[],
    levels: PromotionLevel[],
}

const emptyLevel = (): PromotionLevel => ({
    minValue: 0,
    discountType: "Percent",
    discountValue: 0,
    maxDiscount: 0,
});

const initialFormState: FormState = {
    promotionName: "",
    promotionType: "Product",
    startDate: "",
    endDate: "",
    description: "",

    productDiscounts: [] as ProductDiscountItem[],
    combos: [] as ComboDeal[],
    levels: [emptyLevel()],
};

function promotionToFormState(promotion: Promotion): FormState {
    const base = {
        promotionName: promotion.promotionName,
        promotionType: promotion.promotionType,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        description: promotion.description,
    };

    switch (promotion.promotionType) {
        case "Product":
            return {
                ...initialFormState,
                ...base,
                productDiscounts: promotion.productDiscounts.map((pd) => ({
                    product: pd.product,
                    discountType: pd.discountType,
                    discountValue: pd.discountValue,
                })),
            };

        case "Combo":
            return {
                ...initialFormState,
                ...base,
                combos: promotion.combos.map((c) => ({
                    comboName: c.comboName,
                    comboPrice: c.comboPrice,
                    comboItems: c.comboItems,
                })),
            };

        case "Order":
            return {
                ...initialFormState,
                ...base,
                levels: promotion.levels.map((l) => ({
                    minValue: l.minValue,
                    discountType: l.discountType,
                    discountValue: l.discountValue,
                    maxDiscount: l.maxDiscount,
                })),
            };
    }
}

export function UpdatePromotionForm({ promotion } : { promotion: Promotion }) {
    const [form, setForm] = useState<FormState>(() => promotionToFormState(promotion));
 
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
    }


    return (
        <form
            className="py-10 flex flex-col gap-6"
            onSubmit={handleSubmit}
        >
            {/* Tên khuyến mãi + Mã khuyến mãi */}
            <div className="grid grid-cols-2 gap-6">
                <TextInput
                    label="Mã khuyến mãi"
                    value={promotion.promotionId}
                    placeHolder=""
                    onChange={() => {}}
                    disabled={true}
                />

                <TextInput
                    label="Tên khuyến mãi"
                    value={promotion.promotionName}
                    placeHolder="Nhập tên khuyến mãi"
                    onChange={(e) => setField("promotionName" ,e.target.value)}
                    disabled={promotion.promotionPhase !== "Upcoming"}
                />
            </div>

            {/* Phân loại + Ngày bắt đầu + Ngày kết thúc */}
            <div className="grid grid-cols-3 gap-6">
                <SelectInput
                    label="Phân loại"
                    value={form.promotionType}
                    onChange={() => {}}
                    options={PROMOTION_TYPE_OPTIONS}
                    disabled={true}
                />
 
                <DatePickerInput
                    label="Ngày bắt đầu"
                    value={form.startDate}
                    placeHolder="Chọn ngày bắt đầu"
                    onChange={(date) => setField("startDate", date)}
                    disabled={promotion.promotionPhase !== "Upcoming"}
                />
 
                <DatePickerInput
                    label="Ngày kết thúc"
                    value={form.endDate}
                    placeHolder="Chọn ngày kết thúc"
                    onChange={(date) => setField("endDate", date)}
                    disabled={promotion.promotionPhase !== "Upcoming"}
                />
            </div>
 
            {/* Mô tả */}
            <TextInput
                label="Mô tả"
                value={form.description}
                placeHolder="Mô tả (nếu có)"
                inputType="text"
                onChange={(e) => setField("description", e.target.value)}
                disabled={promotion.promotionPhase !== "Upcoming"}
            />

            {form.promotionType === "Product" && (  
                <ProductPromotionForm 
                    productDiscounts={form.productDiscounts}
                    onChange={(productDiscounts) => setField("productDiscounts", productDiscounts)}
                    isEditable={promotion.promotionPhase === "Upcoming"}
                />
            )}

            {/* Combo */}
            {form.promotionType === "Combo" && (
                <ComboPromotionForm
                    combos={form.combos}
                    onChange={(combos) => setField("combos", combos)}
                    isEditable={promotion.promotionPhase === "Upcoming"}
                />
            )}

            {/* Order */}
            {form.promotionType === "Order" && (
                <OrderPromotionForm
                    levels={form.levels}
                    onChange={(levels) => setField("levels", levels)}
                    isEditable={promotion.promotionPhase === "Upcoming"}
                />
            )}
        </form>
    )
}