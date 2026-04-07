"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    PromotionType,
    DiscountType,
    PromotionLevel,
    CreatePromotion,
} from "@/types/promotion";
import { OwnerSalePageRoute } from "@/const/routes";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { SelectOption } from "@/types/UIType";
import { TrashIcon, AddIcon } from "@/public/assets/Icons";
import { ProductPromotionPicker } from "@/components/Forms/CreatePromotionTypes/ProductPromotionForm";

// ── Options ────────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
    { label: "KM sản phẩm", value: "PRODUCT" },
    { label: "KM combo",    value: "COMBO" },
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

export function CreatePromotionForm() {
    const router = useRouter();

    // Base fields
    const [promotionName, setPromotionName] = useState("");
    const [promotionType, setPromotionType] = useState<PromotionType>("PRODUCT");
    const [startDate, setStartDate]         = useState("");
    const [endDate, setEndDate]             = useState("");
    const [description, setDescription]    = useState("");
    const [discountType, setDiscountType]   = useState<DiscountType>("PERCENT");
    const [discountValue, setDiscountValue] = useState<number>(0);

    // PRODUCT-specific
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

    // ORDER-specific
    const [levels, setLevels] = useState<PromotionLevel[]>([emptyLevel()]);

    // TODO: comboIds — handled by you
    // const [selectedComboId, setSelectedComboId] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Build payload ──────────────────────────────────────────────────────────

    const buildPayload = (): CreatePromotion | null => {
        const base = { promotionName, startDate, endDate, description, discountType, discountValue };

        if (promotionType === "PRODUCT")
            return { ...base, promotionType: "PRODUCT", productIds: selectedProductId ? [selectedProductId] : [] };
        if (promotionType === "COMBO")
            return { ...base, promotionType: "COMBO", comboIds: [] }; // TODO: wire comboId
        if (promotionType === "ORDER")
            return { promotionName, startDate, endDate, description, promotionType: "ORDER", levels };

        return null;
    };

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        const payload = buildPayload();
        if (!payload) return;

        setIsSubmitting(true);
        try {
            // TODO: replace with your actual API call, e.g. CreatePromotion(payload)
            console.log("Submitting:", payload);
            router.push(OwnerSalePageRoute);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="py-10 flex flex-col gap-6">

            {/* Tên khuyến mãi */}
            <TextInput
                label="Tên khuyến mãi"
                value={promotionName}
                placeHolder="Nhập tên khuyến mãi"
                onChange={(e) => setPromotionName(e.target.value)}
            />

            {/* Phân loại + Ngày bắt đầu + Ngày kết thúc */}
            <div className="grid grid-cols-3 gap-6">
                <SelectInput
                    label="Phân loại"
                    value={promotionType}
                    onChange={(v) => setPromotionType(v as PromotionType)}
                    options={PROMOTION_TYPE_OPTIONS}
                />
                <TextInput
                    label="Ngày bắt đầu"
                    value={startDate}
                    placeHolder="DD/MM/YYYY"
                    inputType="text"
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <TextInput
                    label="Ngày kết thúc"
                    value={endDate}
                    placeHolder="DD/MM/YYYY"
                    inputType="text"
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>

            {/* Mô tả */}
            <TextInput
                label="Mô tả"
                value={description}
                placeHolder="Mô tả (nếu có)"
                inputType="text"
                onChange={(e) => setDescription(e.target.value)}
            />

            {/* ── Type-specific ──────────────────────────────────────────────── */}

            {/* PRODUCT */}
            {promotionType === "PRODUCT" && (
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
            )}

            {/* COMBO */}
            {promotionType === "COMBO" && (
                <div className="flex flex-col gap-y-2.5">
                    <p className="text-sm font-normal text-tgray9">Combo áp dụng</p>
                    <div className="rounded-lg border-[0.5px] border-dashed border-tgray5 px-4 py-8 text-center text-sm text-gray-400">
                        {/* TODO: your combo picker goes here */}
                        Chọn combo
                    </div>
                </div>
            )}

            {/* ORDER */}
            {promotionType === "ORDER" && (
                <div className="flex flex-col gap-y-2.5">
                    <p className="text-sm font-normal text-tgray9">Các mức giảm giá</p>
                    <LevelsTable levels={levels} onChange={setLevels} />
                </div>
            )}

            {/* ── Actions ───────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={() => router.push(OwnerSalePageRoute)}
                    className="px-3 py-2 text-sm font-semibold rounded-lg border border-purple text-purple hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Huỷ
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-purple text-white hover:bg-light-purple transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Đang tạo..." : "Tạo khuyến mãi"}
                </button>
            </div>
        </div>
    );
}