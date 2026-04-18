"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PromotionType, DiscountType, PromotionLevel, CreatePromotion } from "@/types/promotion";
import { OwnerSalePageRoute } from "@/const/routes";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SelectOption } from "@/types/UIType";
import { TrashIcon, AddIcon } from "@/public/assets/Icons";
import { ProductPromotionPicker } from "@/components/Forms/CreatePromotionTypes/ProductPromotionForm";
import { DatePickerInput } from "../FormInputs/DatePickerInput";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FetchPromotionId } from "@/api/promotions/promotions";

// ── Options ────────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
    { label: "KM sản phẩm", value: "PRODUCT" },
    { label: "KM combo", value: "COMBO" },
    { label: "KM đơn hàng", value: "ORDER" },
];

const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
    { label: "Phần trăm (%)",   value: "PERCENT" },
    { label: "Số tiền cố định", value: "FIXED" },
];

const emptyLevel = (): PromotionLevel => ({
    minValue: 0,
    discountValue: 0,
    discountType: "PERCENT",
    maxDiscount: undefined,
});

// ── ORDER: Levels table ────────────────────────────────────────────────────────

function LevelsTable({
    levels,
    onChange,
}: {
    levels: PromotionLevel[];
    onChange: (levels: PromotionLevel[]) => void;
}) {
    const addRow    = () => onChange([...levels, emptyLevel()]);
    const removeRow = (i: number) => onChange(levels.filter((_, idx) => idx !== i));
    const updateRow = (i: number, patch: Partial<PromotionLevel>) =>
        onChange(levels.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

    return (
        <div>
            <div className="overflow-x-auto rounded-lg border-[0.5px] border-tgray5">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-tgray9 text-left">
                            <th className="px-4 py-3 font-normal">Giá trị tối thiểu</th>
                            <th className="px-4 py-3 font-normal">Giá trị giảm</th>
                            <th className="px-4 py-3 font-normal">Loại giảm</th>
                            <th className="px-4 py-3 font-normal">Giảm tối đa</th>
                            <th className="px-4 py-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.map((level, i) => (
                            <tr key={i} className="border-t border-tgray5">
                                <td className="px-3 py-2">
                                    <input type="number" min={0} value={level.minValue}
                                        onChange={(e) => updateRow(i, { minValue: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full h-10 px-2.5 rounded-lg border-[0.5px] border-tgray5 focus:outline-none focus:ring-1 focus:border-purple focus:ring-purple transition-colors caret-purple text-sm"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" min={0} value={level.discountValue}
                                        onChange={(e) => updateRow(i, { discountValue: Number(e.target.value) })}
                                        placeholder="0"
                                        className="w-full h-10 px-2.5 rounded-lg border-[0.5px] border-tgray5 focus:outline-none focus:ring-1 focus:border-purple focus:ring-purple transition-colors caret-purple text-sm"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <SelectInput
                                        label=""
                                        value={level.discountType}
                                        onChange={(v) => updateRow(i, { discountType: v as DiscountType })}
                                        options={DISCOUNT_TYPE_OPTIONS}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input type="number" min={0} value={level.maxDiscount ?? ""}
                                        onChange={(e) => updateRow(i, {
                                            maxDiscount: e.target.value === "" ? undefined : Number(e.target.value),
                                        })}
                                        placeholder="Không giới hạn"
                                        className="w-full h-10 px-2.5 rounded-lg border-[0.5px] border-tgray5 focus:outline-none focus:ring-1 focus:border-purple focus:ring-purple transition-colors caret-purple text-sm"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <button
                                        onClick={() => removeRow(i)}
                                        disabled={levels.length === 1}
                                        className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        <TrashIcon width={24} height={24} className="text-red" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button
                onClick={addRow}
                className="mt-3 flex items-center gap-1 text-sm text-pink-500 font-medium hover:text-pink-600 cursor-pointer transition-colors"
            >
                <AddIcon height={16} width={16} className="" />
                Thêm mức
            </button>
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface FormState {
    promotionName: string,
    promtionType: PromotionType,
    startDate: string,
    endDate: string,
    description: string,
    discountType: DiscountType,
}

const initialFormState: FormState = {
    promotionName: "",
    promtionType: "PRODUCT",
    startDate: "",
    endDate: "",
    description: "",
    discountType: "PERCENT",
}

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

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(form);
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
                    onChange={(value) => setField("promtionType", value as PromotionType)}
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
            {/* {promotionType === "PRODUCT" && (
                <div className="flex flex-col gap-y-2.5">
                    <p className="text-sm font-normal text-tgray9">Sản phẩm áp dụng</p>
                    <ProductPromotionPicker
                        selectedProductId={selectedProductId}
                        discountType={discountType}
                        discountValue={discountValue}
                        onChange={(id, type, value) => {
                            setSelectedProductId(id);
                            setDiscountType(type);
                            setDiscountValue(value);
                        }}
                    />
                </div>
            )} */}

            {/* COMBO */}
            {/* {promotionType === "COMBO" && (
                <div className="flex flex-col gap-y-2.5">
                    <p className="text-sm font-normal text-tgray9">Combo áp dụng</p>
                    <div className="rounded-lg border-[0.5px] border-dashed border-tgray5 px-4 py-8 text-center text-sm text-gray-400">
                        Chọn combo
                    </div>
                </div>
            )} */}

            {/* ORDER */}
            {/* {promotionType === "ORDER" && (
                <div className="flex flex-col gap-y-2.5">
                    <p className="text-sm font-normal text-tgray9">Các mức giảm giá</p>
                    <LevelsTable levels={levels} onChange={setLevels} />
                </div>
            )} */}

            {/* ── Actions ───────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={() => router.push(OwnerSalePageRoute)}
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