"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { SaleOrderResponse } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { PaymentMethod } from "@/const/PaymentMethod";
import { useParams, useRouter } from "next/navigation";
// import { useSelector } from "react-redux";
// import { RootState } from "@/utilities/store";
import { FetchEmployeeSaleOrder } from "@/api/saleOrders.ts/saleOrders";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { OwerEmployeeSaleOrderDetail } from "@/const/routes";

export function EmployeeSaleOrderTable () {
    const router = useRouter();
    const { employeeId } = useParams<{ employeeId: string }>();
    // const user = useSelector((state: RootState) => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const { data, isLoading } = useQuery({
        queryKey: ["employee-sale-orders", employeeId],
        queryFn: () => FetchEmployeeSaleOrder(employeeId),
        enabled: !!employeeId,
    });

    const paymentOptions: { value: string, label: string }[] = [
    { value: PaymentMethod.CASH, label: "Tiền mặt" },
    { value: PaymentMethod.TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.DEBIT, label: "Ghi nợ" }
    ];


    const columns: Column<SaleOrderResponse>[] = [
        { title: "Mã đơn hàng", key: "orderId", render: (row) => <span>{row.saleOrderId}</span>},
        { title: "Tên khách hàng", key: "customerName", render: (row) => <span>{row.customerName}</span>},
        { title: "Thời gian xuất", key: "createdAt", render: (row) => <span>{new Date(row.createdAt).toLocaleString()}</span>},
        { title: "Thành tiền", key: "totalAmount", render: (row) => <span>{formatThousands(row.totalPrice)} VNĐ</span>},
        { title: "Lợi nhuận", key: "profit", render: (row) => <span>{formatThousands(row.totalProfit)} VNĐ</span>},
        { title: "Hình thức thanh toán", key: "paymentMethod", render: (row) => (
            <span>
                {paymentOptions.find(opt => opt.value === row.paymentMethod)?.label ?? row.paymentMethod}
            </span>
        )},

        { title: "Số tiền nợ", key: "debtAmount", render: (row) => <span>{formatThousands(row.debitMoney)} VNĐ</span>},

        {
            title: "",
            key: "action",
            render: (row) => (
                <button
                    onClick={() => router.push(OwerEmployeeSaleOrderDetail(employeeId, row.id))}
                    className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/10 hover:cursor-pointer"
                >
                    Xem
                </button>
            )
        }
    ] ;
    
    const saleOrders = data?.items ?? [];
    const total = data?.total ?? 0;

    return (
        <Table
            columns={columns}
            data={saleOrders}
            isLoading={isLoading}
            pagination={{
                current: currentPage,
                pageSize,
                total,
                onChange: setCurrentPage,
            }}        
        />
    );

}