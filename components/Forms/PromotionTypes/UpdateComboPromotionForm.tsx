"use client";

import { ComboDeal, ComboPromotion } from "@/types/promotion";
import { ComboTable } from "../../Tables/Promotions/ComboTable";
import { useState } from "react";
import { SharedPromotionFields } from "./SharedPromotionFields";

interface UpdateComboPromotionFormProps {
    promotion: ComboPromotion;
}

interface FormState {
    promotionName: string;
    startDate: string;
    endDate: string;
    description: string;
    combos: ComboDeal[];
}

export function UpdateComboPromotionForm({ promotion } : UpdateComboPromotionFormProps) {
    const [formState, setFormState] = useState<FormState>({
        promotionName: promotion.promotionName,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        description: promotion.description,
        combos: promotion.combos
    });

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    };

    // -- Handlers ----------------------------------------------------------------

    const addCombo = () => {
        const newCombo: ComboDeal = {
            comboName: "",
            comboItems: [],
            comboPrice: 0,
        };
        
        setField("combos", [...formState.combos, newCombo]);
    };

    const updateCombo = (index: number, patch: Partial<ComboDeal>) => {
        setField("combos", formState.combos.map((combo, i) => i === index ? { ...combo, ...patch } : combo));
    };

    const removeCombo = (index: number) => {
        setField("combos", formState.combos.filter((_, i) => i !== index));
    };

    // -- Render ------------------------------------------------------------------
    
    return (
        <form
            className="py-10 flex flex-col gap-6"
        >
            <SharedPromotionFields
                promotion={promotion}
                values={formState}
                onChange={setField}
            />

            <div className="flex items-center justify-between">
                <p className="text-sm font-normal text-tgray9">Combo áp dụng</p>

                {promotion.promotionPhase === "Upcoming" && (
                    <button
                        type="button"
                        onClick={addCombo}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-purple text-white hover:bg-purple/80 transition-colors cursor-pointer"
                    >
                        + Thêm combo
                    </button>
                )}
            </div>

            {formState.combos.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {formState.combos.map((combo, index) => (
                        <ComboTable
                            key={index}
                            combo={combo}
                            index={index}
                            onUpdate={(patch) => updateCombo(index, patch)}
                            onRemove={() => removeCombo(index)}
                            isEditable={promotion.promotionPhase === "Upcoming"}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-lg border-[0.5px] border-dashed border-tgray5 px-4 py-8 text-center text-sm text-gray-400">
                    Nhấn &quot;+ Thêm combo&quot; để bắt đầu tạo combo khuyến mãi
                </div>
            )}
        </form>
    );
}