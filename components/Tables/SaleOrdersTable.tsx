"use client";

import { useState } from "react";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { useDebounce } from "@/hooks/useDebounce";

const timeFilters = [
    { label: "Xem tất cả", value: "" },
    { label: "Tháng này", value: "this_month" },
    { label: "Tuần này", value: "this_week" },
    { label: "Hôm qua", value: "yesterday" },
    { label: "Hôm nay", value: "today" },
];

export function SaleOrdersTable() {
    const [selectedTimeFilter, setSelectedTimeFilter] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

    const handleTimeFilterChange = (filter: string) => {
        setSelectedTimeFilter(filter);
    };

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2">
                {timeFilters.map((filter) => (
                    <button
                        key={filter.value}
                        onClick={() => handleTimeFilterChange(filter.value)}
                        className={`py-2 px-4 rounded-lg border border-pink text-sm font-medium transition hover:cursor-pointer ${
                            selectedTimeFilter === filter.value ? "bg-pink text-white" : "bg-white text-pink hover:bg-purple/5"}`}
                    >
                        {filter.label}
                    </button>
                ))}

                <NormalSearchInput
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm theo tên khách hàng hoặc mã đơn hàng"
                    className="w-md"
                />
            </div>
        </div>
    );
}