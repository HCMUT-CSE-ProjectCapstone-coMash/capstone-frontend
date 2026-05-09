"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table } from "./Table";
import { Column } from "@/types/UIType";
import { useDebounce } from "@/hooks/useDebounce";
import { formatThousands } from "@/utilities/numberFormat";
import { Customer } from "@/types/customer";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { FetchCustomers } from "@/api/customers/customers";
import { EmployeeCustomerByIdPageRoute, OwnerCustomerByIdPageRoute } from "@/const/routes";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { useRouter } from "next/navigation";

export default function CustomerTable() {
    // --- 1. States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const pageSize = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    // --- 2. Fetch Data ---
    const { data, isLoading } = useQuery({
        // QueryKey bao gồm trang hiện tại và từ khóa tìm kiếm
        queryKey: ["customers", currentPage, effectiveSearch],
        queryFn: () => FetchCustomers(currentPage, pageSize, effectiveSearch),
    });

    // --- 3. Columns Definition ---
    const columns: Column<Customer>[] = [
        { 
            title: "Tên khách hàng", 
            key: "customerName", 
            render: (row) => <span>{row.customerName}</span> 
        },
        { 
            title: "Số điện thoại", 
            key: "customerPhone", 
            render: (row) => <span>{row.customerPhone}</span> 
        },
        { 
            title: "Số tiền nợ", 
            key: "debtMoney", 
            render: (row) => <span>{formatThousands(row.debitMoney)}</span>
        },
        { 
            title: "Số ngày nợ", 
            key: "debtDays", 
            render: (row) => {
                if (!row.debitDays || row.debitDays === 0) return <span className="text-gray-400">-</span>;
                const isOverdue = row.debitDays >= 7;
                return (
                    <span className={isOverdue ? "text-red font-semibold" : ""}>
                        {row.debitDays} ngày
                    </span>
                );
            } 
        },
        {
            title: "",
            key: "action",
            render: (row) => (
                <button
                    onClick={() => router.push(
                        user.role === "owner"
                            ? OwnerCustomerByIdPageRoute(row.id)
                            : EmployeeCustomerByIdPageRoute(row.id)
                    )}
                    className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/10 hover:cursor-pointer"
                >
                    Xem
                </button>
            )
        }
    ];

    const customers = data?.items ?? [];
    const total = data?.total ?? 0;

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => handleSearch("")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            searchQuery === "" 
                            ? "bg-pink text-white shadow-sm" 
                            : "border border-pink text-pink hover:bg-pink/5"
                        }`}
                    >
                        Xem tất cả
                    </button>
                    <button 
                        onClick={() => handleSearch("debitMoney")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            searchQuery === "debitMoney" 
                            ? "bg-pink text-white shadow-sm" 
                            : "border border-pink text-pink hover:bg-pink/5"
                        }`}
                    >
                        Khách hàng nợ
                    </button>
                </div>

                <div className="w-full sm:w-64">
                    <NormalSearchInput 
                        value={searchTerm} 
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Nhập tên khách hàng"
                        className="w-65"
                    />
                </div>
            </div>

            <Table
                columns={columns}
                data={customers}
                isLoading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total,
                    onChange: setCurrentPage,
                }}
            />
        </div>
    );
}