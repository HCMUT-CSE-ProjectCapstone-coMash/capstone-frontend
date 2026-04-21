"use client";

import { ComboDeal } from "@/types/promotion";
import { ComboTable } from "../../Tables/Promotions/ComboTable";

interface ComboPromotionFormProps {
    combos: ComboDeal[];
    onChange: (combos: ComboDeal[]) => void;
}

export function ComboPromotionForm({ combos, onChange }: ComboPromotionFormProps) {

    const addCombo = () => {
        const newCombo: ComboDeal = {
            comboName: "",
            comboItems: [],
            comboPrice: 0,
        };
        onChange([...combos, newCombo]);
    };

    const updateCombo = (index: number, patch: Partial<ComboDeal>) => {
        onChange(combos.map((c, i) => (i === index ? { ...c, ...patch } : c)));
    };

    const removeCombo = (index: number) => {
        onChange(combos.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-normal text-tgray9">Combo áp dụng</p>

                <button
                    type="button"
                    onClick={addCombo}
                    className="px-3 py-2 text-sm font-semibold rounded-lg bg-purple text-white hover:bg-purple/80 transition-colors cursor-pointer"
                >
                    + Thêm combo
                </button>
            </div>

            {combos.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {combos.map((combo, index) => (
                        <ComboTable
                            key={index}
                            combo={combo}
                            index={index}
                            onUpdate={(patch) => updateCombo(index, patch)}
                            onRemove={() => removeCombo(index)}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border-[0.5px] border-dashed border-tgray5 px-4 py-8 text-center text-sm text-gray-400">
                    Nhấn &quot;+ Thêm combo&quot; để bắt đầu tạo combo khuyến mãi
                </div>
            )}
        </div>
    );
}