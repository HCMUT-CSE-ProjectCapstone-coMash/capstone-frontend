import { LevelsTable } from "@/components/Tables/Promotions/LevelsTable";
import { OrderPromotion, PromotionLevel } from "@/types/promotion";
import { AddIcon } from "@/public/assets/Icons";
import { useState } from "react";
import { SharedPromotionFields } from "./SharedPromotionFields";

interface UpdateOrderPromotionFormProps {
    promotion: OrderPromotion;
}

interface FormState {
    promotionName: string;
    startDate: string;
    endDate: string;
    description: string;
    levels: PromotionLevel[];
}

export function UpdateOrderPromotionForm({ promotion } : UpdateOrderPromotionFormProps) {
    const [formState, setFormState] = useState<FormState>({
        promotionName: promotion.promotionName,
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        description: promotion.description,
        levels: promotion.levels
    });

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setFormState((prev) => ({ ...prev, [key]: value }));
    }

    // -- Handlers ----------------------------------------------------------------

    const addLevel = () => {
        const newLevel: PromotionLevel = {
            minValue: 0,
            discountType: "Percent",
            discountValue: 0,
            maxDiscount: 0,
        };

        setField("levels", [...formState.levels, newLevel]);
    }

    const updateLevel = (index: number, patch: Partial<PromotionLevel>) => {
        setField("levels", formState.levels.map((level, i) => i === index ? { ...level, ...patch } : level));
    }

    const removeLevel = (index: number) => {
        setField("levels", formState.levels.filter((_, i) => i !== index));
    }

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

            <LevelsTable 
                levels={formState.levels} 
                onUpdateLevel={updateLevel} 
                onRemoveLevel={removeLevel} 
                isEditable={promotion.promotionPhase === "Upcoming"}
            />

            <div className="flex justify-end mt-3">
                {promotion.promotionPhase === "Upcoming" && (
                    <button 
                        type="button"
                        className="flex items-center gap-1 text-sm text-pink-500 font-medium hover:text-pink-600 cursor-pointer transition-colors"
                        onClick={addLevel}
                    >
                        <AddIcon width={24} height={24} className=""/>
                        <span className="material-icons-outlined text-sm">Thêm mức giảm giá</span>
                    </button>
                )}
            </div>
        </form>
    );
}