"use client";

import { useRouter } from "next/navigation";
import { PendingListTable } from "@/components/Tables/PendingListTable";


export default function ProductPendingPage() {
    const router = useRouter();

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-purple text-2xl font-medium">Danh sách chờ duyệt</p>
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="py-2 px-4 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/5 hover:cursor-pointer"
                >
                    Danh sách sản phẩm
                </button>
            </div>

            <div className="flex flex-col gap-5">
                <PendingListTable />
            </div>
        </main>
    )
}