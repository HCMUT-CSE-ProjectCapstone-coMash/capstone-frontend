"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table } from "./Table";
import { Column } from "@/types/UIType";
import { formatThousands } from "@/utilities/numberFormat";
import { Customer } from "@/types/customer"

const MOCK_CUSTOMERS: Customer[] = [
    { id: "1", fullName: "Thanh Thuý", phoneNumber: "0901239056", debtAmount: 0, debtDays: 0 },
    { id: "2", fullName: "Bích Phượng", phoneNumber: "0901249056", debtAmount: 100000, debtDays: 7 },
    { id: "3", fullName: "Thanh Loan", phoneNumber: "09012434056", debtAmount: 200000, debtDays: 3 },
    { id: "4", fullName: "Ngọc Anh", phoneNumber: "09014334056", debtAmount: 0, debtDays: 0 },
    { id: "5", fullName: "Khánh Anh", phoneNumber: "09012434056", debtAmount: 200000, debtDays: 5 },
    { id: "6", fullName: "Trần Minh Tú", phoneNumber: "0987654321", debtAmount: 500000, debtDays: 10 },
    { id: "7", fullName: "Lê Hoàng Nam", phoneNumber: "0912345678", debtAmount: 0, debtDays: 0 },
    { id: "8", fullName: "Nguyễn Diệu Nhi", phoneNumber: "0933445566", debtAmount: 150000, debtDays: 2 },
    { id: "9", fullName: "Phạm Bảo Anh", phoneNumber: "0944556677", debtAmount: 300000, debtDays: 8 },
    { id: "10", fullName: "Võ Tuấn Kiệt", phoneNumber: "0955667788", debtAmount: 0, debtDays: 0 },
];

export default function CustomerTable() {

    // --- 3. States ---
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // --- 4. Logic Fetch & Filter Dữ liệu ---
    const { data, isLoading } = useQuery({
            queryKey: ["customers-figma", currentPage],
            queryFn: async () => {
                await new Promise((resolve) => setTimeout(resolve, 300));
                const start = (currentPage - 1) * pageSize;
                return {
                    items: MOCK_CUSTOMERS.slice(start, start + pageSize),
                    total: MOCK_CUSTOMERS.length,
                };
            },
        });

    // --- 5. Định nghĩa Cột (Theo Figma) ---
    const columns: Column<Customer>[] = useMemo(() => [
        { 
            title: "Tên khách hàng", 
            key: "fullName", 
            render: (row) => <span>{row.fullName}</span> 
        },
        { 
            title: "Số điện thoại", 
            key: "phoneNumber", 
            render: (row) => <span>{row.phoneNumber}</span> 
        },
        { 
            title: "Số tiền nợ", 
            key: "debtAmount", 
            render: (row) => (
                <span>{row.debtAmount && row.debtAmount > 0 ? `${formatThousands(row.debtAmount)} VND` : ""}</span>
            ) 
        },
        { 
            title: "Số ngày nợ", 
            key: "debtDays", 
            render: (row) => {
                if (!row.debtDays || row.debtDays === 0) return null;
                // Highlight đỏ nếu nợ trên 5 ngày
                const isOverdue = row.debtDays > 5;
                return (
                    <span className={` text-black ${isOverdue ? "text-red-600 font-medium" : ""}`}>
                        {row.debtDays} ngày
                    </span>
                );
            } 
        }
    ], []);

    return (
        <div>
            <div className="flex justify-between mb-10.25">
                <div className="flex justify-between gap-3">
                    <button className="border bg-pink text-white font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:opacity-90 transition-opacity">
                        Xem tất cả
                    </button>
                    <button className="border border-pink text-pink font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-pink-50">
                        Khách hàng nợ
                    </button>
                </div>
                <div>Thanh search</div>
            </div>
            <div className="w-full">
                <Table
                    columns={columns}
                    data={data?.items ?? []}
                    isLoading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: data?.total ?? 0,
                        onChange: setCurrentPage,
                    }}
                />
            </div>
        </div>
        

    )
}