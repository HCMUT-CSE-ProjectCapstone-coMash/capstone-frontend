"use client";

import { useParams, useRouter } from "next/navigation";

export default function ProductOrderDetailPage() {
    const router = useRouter();
    const { productsOrdersId } = useParams();

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-purple text-2xl font-medium">Sản phẩm nhập tháng 1</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm chờ duyệt
                </button>
            </div>
        </main>
    )
}