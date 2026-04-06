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

// ── Constants ──────────────────────────────────────────────────────────────────

const PROMOTION_TYPE_OPTIONS: { label: string; value: PromotionType }[] = [
    { label: "KM sản phẩm", value: "PRODUCT" },
    { label: "KM combo",    value: "COMBO" },
    { label: "KM đơn hàng", value: "ORDER" },
];

const DISCOUNT_TYPE_OPTIONS: { label: string; value: DiscountType }[] = [
    { label: "Phần trăm (%)", value: "PERCENT" },
    { label: "Số tiền cố định", value: "FIXED" },
];

const emptyLevel = (): PromotionLevel => ({
    minValue: 0,
    discountValue: 0,
    discountType: "PERCENT",
    maxDiscount: undefined,
});

// ── Reusable field components ──────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-medium text-gray-700 mb-1">{children}</p>;
}

function TextInput({
    value,
    onChange,
    placeholder,
    disabled,
}: {
    value: string;
    onChange?: (v: string) => void;
    placeholder?: string;
    disabled?: boolean;
}) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        />
    );
}

function SelectInput({
    value,
    onChange,
    options,
}: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-pink-500 bg-white cursor-pointer"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg width={16} height={16} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </span>
        </div>
    );
}

function NumberInput({
    value,
    onChange,
    placeholder,
}: {
    value: number | "";
    onChange: (v: number | "") => void;
    placeholder?: string;
}) {
    return (
        <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder={placeholder}
            min={0}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-500"
        />
    );
}

// ── ORDER: Levels table ────────────────────────────────────────────────────────

function LevelsTable({
    levels,
    onChange,
}: {
    levels: PromotionLevel[];
    onChange: (levels: PromotionLevel[]) => void;
}) {
    const addRow = () => onChange([...levels, emptyLevel()]);

    const removeRow = (i: number) => onChange(levels.filter((_, idx) => idx !== i));

    const updateRow = (i: number, patch: Partial<PromotionLevel>) => {
        const updated = levels.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
        onChange(updated);
    };

    return (
        <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-left">
                            <th className="px-4 py-3 font-medium">Giá trị tối thiểu</th>
                            <th className="px-4 py-3 font-medium">Giá trị giảm</th>
                            <th className="px-4 py-3 font-medium">Loại giảm</th>
                            <th className="px-4 py-3 font-medium">Giảm tối đa</th>
                            <th className="px-4 py-3 font-medium w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {levels.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                                    Chưa có mức giảm nào. Nhấn + Thêm mức để bắt đầu.
                                </td>
                            </tr>
                        )}
                        {levels.map((level, i) => (
                            <tr key={i} className="border-t border-gray-100">
                                <td className="px-3 py-2">
                                    <NumberInput
                                        value={level.minValue}
                                        onChange={(v) => updateRow(i, { minValue: v === "" ? 0 : v })}
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <NumberInput
                                        value={level.discountValue}
                                        onChange={(v) => updateRow(i, { discountValue: v === "" ? 0 : v })}
                                        placeholder="0"
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <SelectInput
                                        value={level.discountType}
                                        onChange={(v) => updateRow(i, { discountType: v as DiscountType })}
                                        options={DISCOUNT_TYPE_OPTIONS}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <NumberInput
                                        value={level.maxDiscount ?? ""}
                                        onChange={(v) => updateRow(i, { maxDiscount: v === "" ? undefined : v })}
                                        placeholder="(Không giới hạn)"
                                    />
                                </td>
                                <td className="px-3 py-2 text-center">
                                    <button
                                        onClick={() => removeRow(i)}
                                        className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                    >
                                        <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6l-1 14H6L5 6" />
                                            <path d="M10 11v6M14 11v6" />
                                            <path d="M9 6V4h6v2" />
                                        </svg>
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
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
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

    // Type-specific fields
    const [levels, setLevels] = useState<PromotionLevel[]>([]);

    // TODO: productIds and comboIds — handled by you
    // const [productIds, setProductIds] = useState<string[]>([]);
    // const [comboIds, setComboIds] = useState<string[]>([]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── Build payload ────────────────────────────────────────────────────────

    const buildPayload = (): CreatePromotion | null => {
        const base = { promotionName, startDate, endDate, description };
        if (promotionType === "PRODUCT") return { ...base, promotionType: "PRODUCT", productIds: [] };
        if (promotionType === "COMBO")   return { ...base, promotionType: "COMBO",   comboIds: [] };
        if (promotionType === "ORDER")   return { ...base, promotionType: "ORDER",   levels };
        return null;
    };

    // ── Submit ───────────────────────────────────────────────────────────────

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

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-6">

            {/* Tên khuyến mãi */}
            <div>
                <FieldLabel>Tên khuyến mãi</FieldLabel>
                <TextInput
                    value={promotionName}
                    onChange={setPromotionName}
                    placeholder="Khuyến mãi cuối năm"
                />
            </div>

            {/* Phân loại + Ngày bắt đầu + Ngày kết thúc */}
            <div className="grid grid-cols-3 gap-6">
                <div>
                    <FieldLabel>Phân loại</FieldLabel>
                    <SelectInput
                        value={promotionType}
                        onChange={(v) => setPromotionType(v as PromotionType)}
                        options={PROMOTION_TYPE_OPTIONS}
                    />
                </div>
                <div>
                    <FieldLabel>Ngày bắt đầu</FieldLabel>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-pink-500 bg-white cursor-pointer"
                    />
                </div>
                <div>
                    <FieldLabel>Ngày kết thúc</FieldLabel>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 focus:outline-none focus:border-pink-500 bg-white cursor-pointer"
                    />
                </div>
            </div>

            {/* Mô tả */}
            <div>
                <FieldLabel>Mô tả</FieldLabel>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="(Nếu có)"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-pink-500 resize-none"
                />
            </div>

            {/* ── Type-specific section ───────────────────────────────────── */}

            {/* PRODUCT — handled by you */}
            {promotionType === "PRODUCT" && (
                <div>
                    <FieldLabel>Sản phẩm áp dụng</FieldLabel>
                    <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                        {/* TODO: your product picker goes here */}
                        Chọn sản phẩm
                    </div>
                </div>
            )}

            {/* COMBO — handled by you */}
            {promotionType === "COMBO" && (
                <div>
                    <FieldLabel>Combo áp dụng</FieldLabel>
                    <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center text-sm text-gray-400">
                        {/* TODO: your combo picker goes here */}
                        Chọn combo
                    </div>
                </div>
            )}

            {/* ORDER — dynamic levels table */}
            {promotionType === "ORDER" && (
                <div>
                    <FieldLabel>Các mức giảm giá</FieldLabel>
                    <LevelsTable levels={levels} onChange={setLevels} />
                </div>
            )}

            {/* ── Actions ─────────────────────────────────────────────────── */}
            <div className="flex justify-end gap-3 pt-2">
                <button
                    onClick={() => router.push(OwnerSalePageRoute)}
                    className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    Huỷ
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-purple text-white hover:bg-light-purple transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? "Đang tạo..." : "Tạo khuyến mãi"}
                </button>
            </div>
        </div>
    );
}