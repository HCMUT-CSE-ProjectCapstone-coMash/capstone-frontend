"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Table } from "./Table";
import { Column } from "@/types/UIType";
import { useDebounce } from "@/hooks/useDebounce";
import { formatThousands } from "@/utilities/numberFormat";
import { Customer } from "@/types/customer";
import { FetchCustomers } from "@/api/customer/customers";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { useRouter } from "next/navigation";
import { OwnerCustomerByIdPageRoute } from "@/const/routes";
import { useDispatch } from "react-redux";
import { setCustomer } from "@/utilities/customerStore";

export default function CustomerTable() {
    // --- 1. States ---
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const pageSize = 10;
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);
    const router = useRouter();
    const dispatch = useDispatch();

    // --- 2. Fetch Data ---
    const { data, isLoading, isError } = useQuery({
        // QueryKey bao gồm trang hiện tại và từ khóa tìm kiếm
        queryKey: ["customers", currentPage, debouncedSearch],
        queryFn: () => FetchCustomers(currentPage, pageSize, debouncedSearch),
    });

    const handleViewDetail = (customer: Customer) => {
        dispatch(setCustomer(customer));
        router.push(OwnerCustomerByIdPageRoute(customer.id));
    };

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
            render: (row) => (
                <span>
                    {row.debitMoney && row.debitMoney > 0 
                        ? `${formatThousands(row.debitMoney)} VND` 
                        : "0"}
                </span>
            ) 
        },
        { 
            title: "Số ngày nợ", 
            key: "debtDays", 
            render: (row) => {
                if (!row.debitDays || row.debitDays === 0) return <span className="text-gray-400">-</span>;
                const isOverdue = row.debitDays > 5;
                return (
                    <span className={isOverdue ? "text-red font-bold" : ""}>
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
                    onClick={() => handleViewDetail(row)}
                    className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/10 hover:cursor-pointer"
                >
                    Xem
                </button>
            )
        }
    ];

    // --- 4. Handlers ---
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
                        onClick={() => handleSearch("")} // Clear search để xem tất cả
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            searchQuery === "" 
                            ? "bg-pink text-white shadow-sm" 
                            : "border border-pink text-pink hover:bg-pink/5"
                        }`}
                    >
                        Xem tất cả
                    </button>
                    <button 
                        onClick={() => handleSearch("debt")} // Giả sử "debt" là keyword để BE lọc khách nợ
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            searchQuery === "debt" 
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
                            setCurrentPage(1); // Reset về trang 1 khi tìm kiếm mới
                        }}
                        placeholder="Nhập tên khách hàng"
                        className="w-65"
                    />
                </div>
            </div>

            {/* Table Container */}
            <div className="border border-gray-100 overflow-hidden">
                {isError ? (
                    <div className="p-12 text-center">
                        <p className="text-red-500 font-medium">Không thể tải dữ liệu khách hàng.</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="mt-2 text-sm text-gray-500 underline"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
}