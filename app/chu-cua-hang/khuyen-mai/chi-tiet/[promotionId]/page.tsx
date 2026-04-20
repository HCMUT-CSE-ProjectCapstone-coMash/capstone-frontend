"use client";

import { useParams, useRouter } from "next/navigation";

export default function PromotionDetailPage() {
    const { promotionId } = useParams();
    const router = useRouter();
    
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