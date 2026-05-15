"use client";

import { FetchPromotionById } from "@/api/promotions/promotions";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { UpdateProductPromotionForm } from "@/components/Forms/PromotionTypes/UpdateProductPromotionForm";
import { UpdateOrderPromotionForm } from "@/components/Forms/PromotionTypes/UpdateOrderPromotionForm";
import { UpdateComboPromotionForm } from "@/components/Forms/PromotionTypes/UpdateComboPromotionForm";

export function PromotionDetailContent() {
    const { promotionId } = useParams();
    const router = useRouter();
    
    const { data: promotion, isLoading, isError } = useQuery({
        queryKey: ["promotion", promotionId],
        queryFn: () => FetchPromotionById(promotionId as string),
        enabled: !!promotionId,
        refetchOnWindowFocus: false,
    });

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex items-center justify-between mb-5">
                <p className="text-purple text-3xl font-medium">Chi tiết khuyến mãi</p>

                <button
                    type="button"
                    onClick={() => router.back()}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách khuyến mãi
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 text-center text-tgray9">Đang tải khuyến mãi...</div>
            ) : isError ? (
                <div className="py-20 text-center text-red">
                    Không thể tải khuyến mãi. Vui lòng thử lại.
                </div>
            ) : !promotion ? (
                <div className="py-20 text-center text-tgray9">Không tìm thấy khuyến mãi.</div>
            ) : (
                <>
                    {promotion.promotionType === "Product" && (
                        <UpdateProductPromotionForm key={JSON.stringify(promotion)} promotion={promotion} />
                    )}
                    {promotion.promotionType === "Combo" && (
                        <UpdateComboPromotionForm key={JSON.stringify(promotion)} promotion={promotion} />
                    )}
                    {promotion.promotionType === "Order" && (
                        <UpdateOrderPromotionForm key={JSON.stringify(promotion)} promotion={promotion} />
                    )}
                </>
            )}
        </main>
    );
}