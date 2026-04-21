"use client";

import { FetchPromotionById } from "@/api/promotions/promotions";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

export default function PromotionDetailPage() {
    const { promotionId } = useParams();
    const router = useRouter();
    
    const { data, isLoading } = useQuery({
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
                    Danh sach khuyến mãi
                </button>
            </div>


        </main>
    );
}