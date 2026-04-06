"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { useState, useMemo } from "react";
import { SearchIcon } from "@/public/assets/Icons";
import { PromotionType, Promotion } from "@/types/promotion";
import { useRouter } from "next/navigation";

// ── Display label map ──────────────────────────────────────────────────────────

const PROMOTION_TYPE_LABEL: Record<PromotionType, string> = {
    PRODUCT: "KM sản phẩm",
    COMBO:   "KM combo",
    ORDER:   "KM đơn hàng",
};

// ── Filter tabs ────────────────────────────────────────────────────────────────

const FILTER_TABS: { label: string; value: PromotionType | "all" }[] = [
    { label: "Tất cả",      value: "all" },
    { label: "KM sản phẩm", value: "PRODUCT" },
    { label: "KM combo",    value: "COMBO" },
    { label: "KM đơn hàng", value: "ORDER" },
];

// ── Fetch helper (replace with your real API call) ─────────────────────────────

async function fetchPromotions(): Promise<Promotion[]> {
    // TODO: replace with your actual API function, e.g. FetchPromotions()
    const res = await fetch("/api/promotions");
    if (!res.ok) throw new Error("Failed to fetch promotions");
    return res.json();
}

// ── Component ──────────────────────────────────────────────────────────────────

export function PromotionTable() {
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);

    const [activeFilter, setActiveFilter] = useState<PromotionType | "all">("all");
    const [searchQuery, setSearchQuery]   = useState<string>("");

    // ── Data fetching ──────────────────────────────────────────────────────────

    const { data: promotions = [], isLoading } = useQuery<Promotion[]>({
        queryKey: ["promotions"],
        queryFn: fetchPromotions,
        enabled: !!user.id,
    });

    // ── Derived / filtered data ────────────────────────────────────────────────

    const filteredPromotions = useMemo(() => {
        return promotions.filter((promo) => {
            const matchesType =
                activeFilter === "all" || promo.promotionType === activeFilter;
            const matchesSearch =
                promo.promotionName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesType && matchesSearch;
        });
    }, [promotions, activeFilter, searchQuery]);

    // ── Table columns ──────────────────────────────────────────────────────────

    const columns: Column<Promotion>[] = [
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
            render: (row) => <span>{row.startDate}</span>,
        },
        {
            title: "Ngày kết thúc",
            key: "endDate",
            render: (row) => <span>{row.endDate}</span>,
        },
    ];

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="w-full py-10">
            {/* Top bar: filter pills + search */}
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">

                {/* Filter buttons */}
                <div className="flex items-center gap-4 flex-wrap">
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.value;
                        return (
                            <button
                                key={tab.value}
                                onClick={() => setActiveFilter(tab.value)}
                                className={`
                                    px-3 py-2 text-sm font-semibold rounded-lg shadow border cursor-pointer
                                    transition-colors duration-150
                                    ${isActive
                                        ? "bg-pink-500 text-white border-pink-500"
                                        : "bg-white text-pink-500 border-pink-400 hover:bg-pink-50"
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
                
                <div className="flex items-center gap-3">
                    {/* Search input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                            <SearchIcon width={24} height={24} className={""} />
                        </span>
                        <input
                            type="text"
                            placeholder="Nhập tên khuyến mãi"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                                pl-12 pr-4 py-2 rounded-lg border border-gray-400
                                text-sm text-gray-700 placeholder-gray-400
                                focus:outline-none focus:border-pink-500 w-70
                            "
                        />
                    </div>
                    {/* Create button */}

                    {user.role === "owner" && (
                        <button
                            onClick={() => router.push("/nhan-vien/khuyen-mai/tao-khuyen-mai")}
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
                data={filteredPromotions}
                isLoading={isLoading}
            />
        </div>
    );
}