import { LevelsTable } from "@/components/Tables/Promotions/LevelsTable";
import { PromotionLevel } from "@/types/promotion";
import { AddIcon } from "@/public/assets/Icons";

interface OrderPromotionFormProps {
    levels: PromotionLevel[];
    onChange: (levels: PromotionLevel[]) => void;
}

export function OrderPromotionForm({ levels, onChange} : OrderPromotionFormProps) {

    // -- Handlers ----------------------------------------------------------------

    const addLevel = () => {
        const newLevel: PromotionLevel = {
            minValue: 0,
            discountType: "Percent",
            discountValue: 0,
        };

        onChange([...levels, newLevel]);
    }

    const updateLevel = (index: number, patch: Partial<PromotionLevel>) => {
        onChange(levels.map((level, i) => i === index ? { ...level, ...patch } : level));
    }

    const removeLevel = (index: number) => {
        onChange(levels.filter((_, i) => i !== index));
    }

    // -- Render ------------------------------------------------------------------

    return (
        <div className="flex flex-col gap-4">
            <LevelsTable levels={levels} onUpdateLevel={updateLevel} onRemoveLevel={removeLevel}/>

            <div className="flex justify-end mt-3">
                <button 
                    className="flex items-center gap-1 text-sm text-pink-500 font-medium hover:text-pink-600 cursor-pointer transition-colors"
                    onClick={addLevel}
                >
                    <AddIcon width={24} height={24} className=""/>
                    <span className="material-icons-outlined text-sm">Thêm mức giảm giá</span>
                </button>
            </div>
        </div>
    );
}