"use client";

import { useRouter } from "next/navigation";
import { OwnerEmployeeByIdPageRoute, OwnerAddEmployeePageRoute } from "@/const/routes";
import { Employee } from "@/types/employee";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Table } from "./Table";
import { Column } from "@/types/UIType";
import { useDebounce } from "@/hooks/useDebounce";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { FetchEmployees } from "@/api/employees/employees";

export function EmployeeTable() {
    const router = useRouter();
    
    // --- 1. Quản lý State: Phân trang và Tìm kiếm ---
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    // --- 2. Fetch Dữ liệu thật từ Database qua TanStack Query ---
    const { data, isLoading } = useQuery({
        // QueryKey bao gồm cả page và search để tự động refetch khi chúng thay đổi
        queryKey: ["employees", currentPage, debouncedSearch],
        queryFn: () => FetchEmployees(currentPage, pageSize, debouncedSearch),
        refetchOnWindowFocus: false,
    });

    // --- 3. Định nghĩa Cột ---
    const columns: Column<Employee>[] = [
        { 
            title: "Mã số nhân viên", 
            key: "employeeId", 
            render: (row) => <span>{row.employeeId}</span> 
        },
        { 
            title: "Tên nhân viên", 
            key: "fullName", 
            render: (row) => <span>{row.fullName}</span> 
        },
        { 
            title: "Ngày sinh", 
            key: "dateOfBirth", 
            render: (row) => <span>{row.dateOfBirth}</span> 
        },
        { 
            title: "Số điện thoại", 
            key: "phoneNumber", 
            render: (row) => <span>{row.phoneNumber}</span> 
        },
        {
            title: "",
            key: "action",
            render: (row) => (
                <button
                    onClick={() => router.push(OwnerEmployeeByIdPageRoute(row.id))}
                    className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/10 hover:cursor-pointer"
                >
                    Xem
                </button>
            )
        }
    ];

    const employees = data?.items || [];
    const total = data?.totalCount || 0;
    
    return (
        <div className="flex flex-col gap-4 w-full mt-10.25">
            {/* --- Header Section: Search & Button sát phải --- */}
            <div className="flex items-center justify-end gap-4">
                <NormalSearchInput 
                    value={searchTerm} 
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm mới
                    }}
                    placeholder="Nhập tên nhân viên"
                    className="w-80"
                />
                
                <button
                    onClick={() => router.push(`${OwnerAddEmployeePageRoute}`)}
                    className="py-2 px-4 rounded-lg bg-purple text-white text-sm font-semibold transition hover:bg-purple/90 cursor-pointer whitespace-nowrap"
                >
                    Thêm nhân viên mới
                </button>
            </div>

            {/* --- Table Section --- */}
            <div className="mt-6">
                <Table
                    columns={columns}
                    data={employees}
                    isLoading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total,
                        onChange: setCurrentPage,
                    }}
                />
            </div>
        </div>
    );
}