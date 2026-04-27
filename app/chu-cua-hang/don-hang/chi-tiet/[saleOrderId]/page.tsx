"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FetchSaleOrdersById } from "@/api/saleOrders.ts/saleOrders";

export default function SaleOrderDetailPage() {
    const router = useRouter();
    // const { employeeId } = useParams<{ employeeId: string }>();

    // const { data: employee, isLoading, isError } = useQuery({
    //     queryKey: ["employee-detail", employeeId],
    //     queryFn: () => ,
    //     enabled: !!employeeId,
    // });

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Đơn hàng</div>
                <button
                    onClick={() => router.back()}
                    className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                >
                    Danh sách đơn hàng
                </button>
            </div>

            {/* {isLoading && (
                <div className="text-center text-gray-500 py-10">Đang tải...</div>
            )}

            {isError && (
                <div className="text-center text-red-500 py-10">
                    Không thể tải thông tin nhân viên. Vui lòng thử lại.
                </div>
            )} */}

            {/* {employee && <DetailEmployeeByIdForm employee={employee} />} */}
        </main>
    );
}