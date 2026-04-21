import { DiscountType, PromotionLevel } from "@/types/promotion";
import { TextInput } from "@/components/FormInputs/TextInput";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { SelectOption } from "@/types/UIType";
import { SelectInput } from "@/components/FormInputs/SelectInput";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";
import { useDispatch } from "react-redux";
import { TrashIcon } from "@/public/assets/Icons";


const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
    { label: "Phần trăm (%)",   value: "Percent" },
    { label: "Số tiền cố định", value: "Fixed" },
];

// ── Sub-component ──────────────────────────────────────────────────────────────

function computeDiscountedPrice(level: PromotionLevel): { original: number; final: number } {
    const original = level.minValue;

    if (original <= 0 || level.discountValue <= 0) {
        return { original, final: original };
    }

    let discountAmount = level.discountType === "Percent" ? (original * level.discountValue) / 100 : level.discountValue;

    // Cap by maxDiscount if provided
    if (level.maxDiscount && level.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, level.maxDiscount);
    }

    // Final price can't be negative (happens if Fixed discount > minValue)
    const final = Math.max(0, original - discountAmount);

    return { original, final };
}

interface DiscountPreviewProps {
    level: PromotionLevel;
}

function DiscountPreview({ level }: DiscountPreviewProps) {
    const { original, final } = computeDiscountedPrice(level);
    const hasDiscount = final < original;

    if (!hasDiscount) {
        return <span className="text-gray-400 text-sm">—</span>;
    }

    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-red-500 line-through">
                {formatThousands(original)} VNĐ
            </span>
            <span>→</span>
            <span className="text-purple font-bold">
                {formatThousands(final)} VNĐ
            </span>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface LevelsTableProps {
    levels: PromotionLevel[];
    onUpdateLevel: (index: number, patch: Partial<PromotionLevel>) => void;
    onRemoveLevel: (index: number) => void;
    isEditable: boolean;
}

export function LevelsTable({ levels, onUpdateLevel, onRemoveLevel, isEditable }: LevelsTableProps) {
    const dispatch = useDispatch();

    const handleMinValueChange = (index: number, rawValue: string) => {
        const parsed = parseFormattedNumber(rawValue);
        onUpdateLevel(index, { minValue: Math.max(0, parsed) });
    };

    const handleDiscountValueChange = (index: number, rawValue: string) => {
        const parsed = parseFormattedNumber(rawValue);
        const currentType = levels[index].discountType;

        // Percent discounts cannot exceed 100%
        if (currentType === "Percent" && parsed > 100) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Phần trăm giảm không được vượt quá 100%." }));
            onUpdateLevel(index, { discountValue: 100 });
            return;
        }

        // Fixed discounts cannot exceed the minValue for that level
        if (currentType === "Fixed" && parsed > levels[index].minValue) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Số tiền giảm không được vượt quá giá trị tối thiểu." }));
            onUpdateLevel(index, { discountValue: levels[index].minValue });
            return;
        }

        onUpdateLevel(index, { discountValue: Math.max(0, parsed) });
    }

    const handleDiscountTypeChange = (index: number, newType: DiscountType) => {
        const patch: Partial<PromotionLevel> = { discountType: newType as "Percent" | "Fixed" };

        // If changing to Percent, cap existing discountValue at 100
        if (newType === "Percent" && levels[index].discountValue > 100) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Phần trăm giảm không được vượt quá 100%." }));
            patch.discountValue = 100;
        }

        if (newType === "Fixed") {
            patch.maxDiscount = undefined;
        }

        onUpdateLevel(index, patch);
    }

    const handleMaxDiscountChange = (index: number, rawValue: string) => {
        const parsed = parseFormattedNumber(rawValue);
        onUpdateLevel(index, { maxDiscount: parsed > 0 ? parsed : undefined });
    }

    return (
        <div className="rounded-lg border-[0.5px] border-tgray5">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-tgray9 text-left">
                        <th className="px-4 py-3 font-normal">Giá trị tối thiểu</th>
                        <th className="px-4 py-3 font-normal">Loại giảm</th>
                        <th className="px-4 py-3 font-normal">Giá trị giảm</th>
                        <th className="px-4 py-3 font-normal">Giảm tối đa</th>
                        <th className="px-4 py-3 font-normal w-64">Giá sau giảm</th>
                        <th className="px-4 py-3 w-12"></th>
                    </tr>
                </thead>

                <tbody>
                    {levels.map((level, index) => {

                        return(
                            <tr key={index} className="border-t border-tgray5 align-middle">
                                <td className="px-3 py-2">
                                    <TextInput
                                        label=""
                                        inputType="text"
                                        placeHolder="Nhập giá trị tối thiểu"
                                        value={formatThousands(level.minValue)}
                                        onChange={(e) => handleMinValueChange(index, e.target.value)} 
                                        disabled={!isEditable}
                                    />
                                </td>

                                <td className="px-3 py-2">
                                    <SelectInput
                                        label=""
                                        value={level.discountType}
                                        onChange={(v) => handleDiscountTypeChange(index, v as DiscountType)}
                                        options={DISCOUNT_TYPE_OPTIONS}
                                        disabled={!isEditable}
                                    />
                                </td>

                                <td className="px-3 py-2">
                                    <TextInput
                                        label=""
                                        inputType="text"
                                        placeHolder="Nhập giá trị giảm"
                                        value={formatThousands(level.discountValue)}
                                        onChange={(e) => handleDiscountValueChange(index, e.target.value)} 
                                        disabled={!isEditable}
                                    />
                                </td>

                                <td className="px-3 py-2">
                                    <TextInput
                                        label=""
                                        inputType="text"
                                        placeHolder="Nhập giảm tối đa (nếu có)"
                                        value={level.maxDiscount ? formatThousands(level.maxDiscount) : ""}
                                        onChange={(e) => handleMaxDiscountChange(index, e.target.value)} 
                                        disabled={level.discountType === "Fixed" || !isEditable}
                                    />
                                </td>

                                <td className="px-3 pt-3 w-64">
                                    <DiscountPreview level={level} />
                                </td>

                                <td className="px-4 pt-4 w-12 text-center">
                                    {isEditable && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveLevel(index)}
                                            className="cursor-pointer"
                                        >
                                            <TrashIcon width={24} height={24} className="text-red"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}