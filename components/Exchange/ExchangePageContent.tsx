"use client";

import { useParams } from "next/navigation";

export function ExchangePageContent() {
    const { saleOrderId } = useParams();

    console.log(saleOrderId);

    return (
        <main className="px-10 pt-10 pb-25">
            <div className="grid grid-cols-7 gap-x-10 gap-y-5">
                <div className="col-span-5 flex items-center">
                    <p className="text-purple text-3xl font-medium">Đổi hàng</p>
                </div>
            </div>
        </main>
    );
}