"use client";


import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { SaleOrderResponse } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { useParams, useRouter } from "next/navigation";
import { FetchCustomerSaleOrder } from "@/api/saleOrders.ts/saleOrders";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { OwnerCustomerSaleOrderPageRoute } from "@/const/routes";


export function CustomerSaleOrderTable () {
    const router = useRouter();
    const { customerId } = useParams<{ customerId: string }>();
    // const user = useSelector((state: RootState) => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const { data, isLoading } = useQuery({
        queryKey: ["customer-sale-orders", customerId],
        queryFn: () => FetchCustomerSaleOrder(customerId),
        enabled: !!customerId,
    });


    const columns: Column<SaleOrderResponse>[] = [
        { title: "Mã đơn hàng", key: "orderId", render: (row) => <span>{row.saleOrderId}</span>},
        { title: "Người bán hàng", key: "createdbyName", render: (row) => <span>{row.createdByName}</span>},
        { title: "Thời gian xuất", key: "createdAt", render: (row) => <span>{new Date(row.createdAt).toLocaleString()}</span>},
        { title: "Tổng tiền", key: "totalAmount", render: (row) => <span>{formatThousands(row.totalPrice)} VNĐ</span>},

        {
            title: "",
            key: "action",
            render: (row) => (
                <button
                    // onClick={() => router.push(OwerEmployeeSaleOrderDetail(employeeId, row.id))}
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
