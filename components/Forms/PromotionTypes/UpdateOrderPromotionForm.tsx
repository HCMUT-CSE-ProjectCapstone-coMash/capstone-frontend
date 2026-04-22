import { LevelsTable } from "@/components/Tables/Promotions/LevelsTable";
import { OrderPromotion, PromotionLevel, UpdateOrderPromotionPayload } from "@/types/promotion";
import { AddIcon } from "@/public/assets/Icons";
import { useMemo, useState } from "react";
import { SharedPromotionFields } from "./SharedPromotionFields";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateOrderPromotion } from "@/api/promotions/promotions";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

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
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

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

    // -- Dirty check ────────────────────────────────────────────────────────────────
    const isDirty = useMemo(() => {
        if (formState.promotionName !== promotion.promotionName) return true;
        if (formState.startDate !== promotion.startDate) return true;
        if (formState.endDate !== promotion.endDate) return true;
        if (formState.description !== promotion.description) return true;

        // Deep compare product discounts (only the fields the backend cares about)
        const currentItems = formState.levels.map((i) => ({
            minValue: i.minValue,
            type: i.discountType,
            value: i.discountValue,
            maxDiscount: i.maxDiscount,
        }));
        
        const originalItems = promotion.levels.map((i) => ({
            minValue: i.minValue,
            type: i.discountType,
            value: i.discountValue,
            maxDiscount: i.maxDiscount,
        }));

        return JSON.stringify(currentItems) !== JSON.stringify(originalItems);
    }, [formState, promotion]);

    // -- Submit handler ────────────────────────────────────────────────────────────────

    const toPayload = (state: FormState): UpdateOrderPromotionPayload => ({
        promotionName: state.promotionName,
        startDate: state.startDate,
        endDate: state.endDate,
        description: state.description,
        levels: state.levels.map((item) => ({
            minValue: item.minValue,
            discountType: item.discountType,
            discountValue: item.discountValue,
            maxDiscount: item.maxDiscount,
        })),
    });

    const updateMutation = useMutation({
        mutationFn: ({ promotionId, payload }: { promotionId: string, payload: UpdateOrderPromotionPayload }) => UpdateOrderPromotion(promotionId, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["promotion", promotion.id] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Cập nhật khuyến mãi ${data.promotionName} thành công` }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật khuyến mãi thất bại. Vui lòng thử lại." }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formState.promotionName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên khuyến mãi" }));
            return;
        }

        if (!formState.startDate) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn ngày bắt đầu" }));
            return;
        }

        if (!formState.endDate) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng chọn ngày kết thúc" }));
            return;
        }

        if (new Date(formState.startDate) >= new Date(formState.endDate)) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Ngày kết thúc phải sau ngày bắt đầu" }));
            return;
        }

        if (formState.levels.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm ít nhất một mức khuyến mãi" }));
            return;
        }

        const payload = toPayload(formState);

        updateMutation.mutate({ promotionId: promotion.id, payload });
    }

    // -- Render ------------------------------------------------------------------

    return (
        <form
            className="py-10 flex flex-col gap-6"
            onSubmit={handleSubmit}
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

            {promotion.promotionPhase === "Upcoming" && (
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-purple text-white font-medium px-4 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple/80 disabled:opacity-60 disabled:cursor-not-allowed"
                        disabled={!isDirty || updateMutation.isPending}
                    >
                        {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật khuyến mãi"}
                    </button>
                </div>
            )}
        </form>
    );
}