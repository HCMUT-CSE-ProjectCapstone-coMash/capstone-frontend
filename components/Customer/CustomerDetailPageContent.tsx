"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FetchCustomerById } from "@/api/customers/customers";
import { CustomerDetail } from "./CustomerDetail";
import { CustomerSaleOrderTable } from "../Tables/CustomerSaleOrderTable";

export function CustomerDetailPageContent() {
    const router = useRouter();
    const { customerId } = useParams();

    const { data: customer, isLoading, isError } = useQuery({
        queryKey: ["customer", customerId],
        queryFn: () => FetchCustomerById(customerId as string),
        enabled: !!customerId,
        refetchOnWindowFocus: false,
    });

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Khách hàng</div>
                <button
                    onClick={() => router.back()}
                    className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                >
                    Danh sách khách hàng
                </button>
            </div>

            {isLoading && (
                <div className="text-center text-gray-500 py-10">Đang tải...</div>
            )}

            {isError && (
                <div className="text-center text-red-500 py-10">
                    Không thể tải thông tin khách hàng hàng. Vui lòng thử lại.
                </div>
            )}

            {customer && <CustomerDetail customer={customer} />}
            <div className="mt-5">
                <p className="text-lg text-purple font-semibold">Danh sách đơn hàng</p>
                <CustomerSaleOrderTable />
            </div>
        </main>
    );
}