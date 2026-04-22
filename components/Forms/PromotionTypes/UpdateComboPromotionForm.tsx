"use client";

import { ComboDeal, ComboPromotion, UpdateComboPromotionPayload } from "@/types/promotion";
import { ComboTable } from "../../Tables/Promotions/ComboTable";
import { useMemo, useState } from "react";
import { SharedPromotionFields } from "./SharedPromotionFields";
import { useDispatch } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { UpdateComboPromotion } from "@/api/promotions/promotions";

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
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

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

    // -- Dirty check ────────────────────────────────────────────────────────────────
    const isDirty = useMemo(() => {
        if (formState.promotionName !== promotion.promotionName) return true;
        if (formState.startDate !== promotion.startDate) return true;
        if (formState.endDate !== promotion.endDate) return true;
        if (formState.description !== promotion.description) return true;

        // Deep compare product discounts (only the fields the backend cares about)
        const currentItems = formState.combos.map((i) => ({
            comboName: i.comboName,
            comboPrice: i.comboPrice,
            comboItems: i.comboItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
            })),
        }));

        const originalItems = promotion.combos.map((i) => ({
            comboName: i.comboName,
            comboPrice: i.comboPrice,
            comboItems: i.comboItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
            })),
        }));

        return JSON.stringify(currentItems) !== JSON.stringify(originalItems);
    }, [formState, promotion]);

    // -- Submit handler & mutation -------------------------------------------------------

    const toPayload = (state: FormState): UpdateComboPromotionPayload => ({
        promotionName: state.promotionName,
        startDate: state.startDate,
        endDate: state.endDate,
        description: state.description,
        combos: state.combos.map((combo) => ({
            comboName: combo.comboName,
            comboPrice: combo.comboPrice,
            comboItems: combo.comboItems.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
            })),
        }))
    });

    const updateMutation = useMutation({
        mutationFn: ({ promotionId, payload }: { promotionId: string, payload: UpdateComboPromotionPayload }) => UpdateComboPromotion(promotionId, payload),
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

        if (formState.combos.length === 0) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng thêm ít nhất một combo áp dụng" }));
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