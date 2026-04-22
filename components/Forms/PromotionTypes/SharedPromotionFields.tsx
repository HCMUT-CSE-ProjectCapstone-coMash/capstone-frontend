// @/components/Forms/PromotionTypes/SharedPromotionFields.tsx
"use client";

import { TextInput } from "@/components/FormInputs/TextInput";
import { SelectInput } from "@/components/FormInputs/SelectInput";
import { DatePickerInput } from "@/components/FormInputs/DatePickerInput";
import { SelectOption } from "@/types/UIType";
import { Promotion } from "@/types/promotion";

const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
    { label: "KM sản phẩm", value: "Product" },
    { label: "KM combo", value: "Combo" },
    { label: "KM đơn hàng", value: "Order" },
];

interface SharedPromotionFieldsState {
    promotionName: string;
    startDate: string;
    endDate: string;
    description: string;
}

interface SharedPromotionFieldsProps { 
    promotion: Promotion; 
    values: SharedPromotionFieldsState;
    onChange: <K extends keyof SharedPromotionFieldsState>(key: K, value: SharedPromotionFieldsState[K]) => void;
}

export function SharedPromotionFields({ promotion, values, onChange }: SharedPromotionFieldsProps) {
    const isEditable = promotion.promotionPhase === "Upcoming";

    return (
        <>
            {/* Mã khuyến mãi + Tên khuyến mãi */}
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
                    value={values.promotionName}
                    placeHolder="Nhập tên khuyến mãi"
                    onChange={(e) => onChange("promotionName", e.target.value)}
                    disabled={!isEditable}
                />
            </div>

            {/* Phân loại + Ngày bắt đầu + Ngày kết thúc */}
            <div className="grid grid-cols-3 gap-6">
                <SelectInput
                    label="Phân loại"
                    value={promotion.promotionType}
                    onChange={() => {}}
                    options={PROMOTION_TYPE_OPTIONS}
                    disabled={true}
                />
                <DatePickerInput
                    label="Ngày bắt đầu"
                    value={values.startDate}
                    placeHolder="Chọn ngày bắt đầu"
                    onChange={(date) => onChange("startDate", date)}
                    disabled={!isEditable}
                />
                <DatePickerInput
                    label="Ngày kết thúc"
                    value={values.endDate}
                    placeHolder="Chọn ngày kết thúc"
                    onChange={(date) => onChange("endDate", date)}
                    disabled={!isEditable}
                />
            </div>

            {/* Mô tả */}
            <TextInput
                label="Mô tả"
                value={values.description}
                placeHolder="Mô tả (nếu có)"
                inputType="text"
                onChange={(e) => onChange("description", e.target.value)}
                disabled={!isEditable}
            />
        </>
    );
}