"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { useState } from "react";
import { PromotionType, Promotion, PromotionPhase } from "@/types/promotion";
import { useRouter } from "next/navigation";
import { EmployeeSaleByIdPageRoute, OwnerCreateSalePageRoute, OwnerSaleByIdPageRoute } from "@/const/routes";
import { useDebounce } from "@/hooks/useDebounce";
import { FetchPromotions } from "@/api/promotions/promotions";
import { NormalSearchInput } from "../FormInputs/NormalSearchInput";
import { formatDate } from "@/utilities/timeFormat";

// ── Display label map ──────────────────────────────────────────────────────────

const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
    Product: "KM sản phẩm",
    Combo:   "KM combo",
    Order:   "KM đơn hàng",
};

const PHASE_DISPLAY: Record<PromotionPhase, { label: string; color: string }> = {
    Upcoming: { label: "Sắp diễn ra",  color: "bg-blue-100 text-blue-800" },
    Ongoing:  { label: "Đang diễn ra", color: "bg-green-100 text-green-800" },
    Expired:  { label: "Đã kết thúc",  color: "bg-gray-100 text-gray-800" },
};

// ── Filter tabs ────────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: PromotionType | "" }[] = [
    { label: "Tất cả",      value: "" },
    { label: "KM sản phẩm", value: "Product" },
    { label: "KM combo",    value: "Combo" },
    { label: "KM đơn hàng", value: "Order" },
];

// ── Component ──────────────────────────────────────────────────────────────────
type PromotionStatusBadgeProps = {
    phase: PromotionPhase;
};

function PromotionStatusBadge({ phase }: PromotionStatusBadgeProps) {
    const { label, color } = PHASE_DISPLAY[phase];

    return (
        <span className={`px-2 py-1 rounded ${color} text-sm font-medium`}>
            {label}
        </span>
    );
}

// -- Main component ----──────────────────────────────────────────────────────────────────

export function PromotionTable() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    const columns: Column<Promotion>[] = [
        {
            title: "Mã khuyến mãi",
            key: "code",
            render: (row) => <span>{row.promotionId}</span>,
        },
        {
            title: "Tên khuyến mãi",
            key: "name",
            render: (row) => <span>{row.promotionName}</span>,
        },
        {
            title: "Loại khuyến mãi",
            key: "type",
            render: (row) => <span>{PROMOTION_TYPE_LABEL[row.promotionType]}</span>,
        },
        {
            title: "Ngày bắt đầu",
            key: "startDate",
            render: (row) => <span>{formatDate(row.startDate)}</span>,
        },
        {
            title: "Ngày kết thúc",
            key: "endDate",
            render: (row) => <span>{formatDate(row.endDate)}</span>,
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (row) => <PromotionStatusBadge phase={row.promotionPhase} />,
        },
        {
            title: "",
            key: "action",
            render: (row) => (
                <button
                    onClick={() => {
                        if (user.role === "owner") {
                            router.push(OwnerSaleByIdPageRoute(row.id));
                        } else {
                            router.push(EmployeeSaleByIdPageRoute(row.id));
                        }
                        router.refresh();
                    }}
                    className="py-1.5 px-3 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/10 hover:cursor-pointer"
                >
                    Xem
                </button>
            ),
        }
    ];

    // ── State & Data Fetching ─────────────────────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const [activeFilter, setActiveFilter] = useState<PromotionType | "">("");

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";

    const { data, isLoading } = useQuery({
        queryKey: ["promotions", currentPage, activeFilter, effectiveSearch],
        queryFn: () => FetchPromotions(currentPage, pageSize, activeFilter, effectiveSearch),
        refetchOnWindowFocus: false,
    });

    const promotions = data?.items || [];
    const totalPages = data?.total ?? 0;

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="w-full py-10">
            {/* Top bar: filter pills + search */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">

                {/* Filter buttons */}
                <div className="flex items-center gap-4 flex-wrap">
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            className={`
                                px-3 py-2 text-sm font-semibold rounded-lg shadow border cursor-pointer
                                transition-colors duration-150
                                ${activeFilter === tab.value
                                    ? "bg-pink-500 text-white border-pink-500"
                                    : "bg-white text-pink-500 border-pink-400 hover:bg-pink-50"
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search input */}
                    <NormalSearchInput
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        placeholder={"Tìm theo mã hoặc tên khuyến mãi"}
                        className="w-2xs"
                    />

                    {/* Create button */}
                    {user.role === "owner" && (
                        <button
                            onClick={() => router.push(OwnerCreateSalePageRoute)}
                            className="px-3 py-2 text-sm font-semibold rounded-lg shadow cursor-pointer bg-purple text-white hover:bg-light-purple transition-opacity duration-150 whitespace-nowrap"
                        >
                            Tạo khuyến mãi mới
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={promotions}
                isLoading={isLoading}
                pagination={{
                    current: currentPage,
                    pageSize,
                    total: totalPages,
                    onChange: setCurrentPage,
                }}
            />
        </div>
    );
}