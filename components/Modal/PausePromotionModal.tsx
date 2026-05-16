import { PausePromotion } from "@/api/promotions/promotions";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

interface PausePromotionModalProps {
    promotionId: string;
    onClose: () => void;
}

export function PausePromotionModal({ promotionId, onClose } : PausePromotionModalProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const pausePromotionMutation = useMutation({
        mutationFn: ({ promotionId } : { promotionId: string }) => PausePromotion(promotionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["promotions"] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Dừng khuyến mãi thành công!" }));
            router.back();
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Dừng khuyến mãi thất bại. Vui lòng thử lại." }));
        }
    });

    return (
        <div className="w-lg flex flex-col gap-5 p-5">
            <p className="text-lg text-center">Bạn có chắc chắn muốn dừng khuyến mãi này?</p>

            <div className="flex items-center justify-center gap-5">
                <button
                    onClick={() => pausePromotionMutation.mutate({ promotionId })}
                    disabled={pausePromotionMutation.isPending}
                    className="py-2 px-4 rounded-lg w-35 border border-red-500 bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <p> {pausePromotionMutation.isPending ? "Đang dừng..." : "Dừng"} </p>
                </button>

                <button
                    onClick={onClose}
                    className="py-2 px-4 rounded-lg w-35 border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/80 hover:cursor-pointer"
                >
                    <p> Huỷ </p>
                </button>
            </div>
        </div>
    )
}