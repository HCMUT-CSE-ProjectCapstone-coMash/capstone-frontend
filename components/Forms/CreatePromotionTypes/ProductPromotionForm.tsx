"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@/types/product";
import { DiscountType } from "@/types/promotion";
import { FetchApprovedProductByName } from "@/api/products/products";
import { SearchIcon, TrashIcon } from "@/public/assets/Icons";
import { TextInput } from "@/components/FormInputs/TextInput";
import { SelectInput } from "@/components/FormInputs/SelectInput";
import { SelectOption } from "@/types/UIType";
import Image from "next/image";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
// ── Options ────────────────────────────────────────────────────────────────────

const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
    { label: "Phần trăm (%)",   value: "PERCENT" },
    { label: "Số tiền cố định", value: "FIXED" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const totalQuantity = (product: Product) =>
    product.quantities.reduce((sum, q) => sum + q.quantities, 0);

const formatPrice = (price: number) =>
    price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

// ── Props ──────────────────────────────────────────────────────────────────────

interface ProductPromotionPickerProps {
    selectedProductId: string | null;
    discountType: DiscountType;
    discountValue: number;
    onChange: (
        productId: string | null,
        discountType: DiscountType,
        discountValue: number
    ) => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ProductPromotionPicker({
    selectedProductId,
    discountType,
    discountValue,
    onChange,
}: ProductPromotionPickerProps) {
    const [search, setSearch]                   = useState("");
    const [submittedSearch, setSubmittedSearch] = useState("");
    const [showDropdown, setShowDropdown]       = useState(false);

    // ── Fetch ──────────────────────────────────────────────────────────────────

    const { data: searchResults = [], isFetching } = useQuery<Product[]>({
        queryKey: ["productSearch", submittedSearch],
        queryFn: () => FetchApprovedProductByName(submittedSearch),
        enabled: submittedSearch.trim().length > 0,
    });

    const selectedProduct = searchResults.find((p) => p.id === selectedProductId) ?? null;

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setSubmittedSearch(search);
            setShowDropdown(true);
        }
    };

    const handleSelect = (product: Product) => {
        onChange(product.id, discountType, discountValue);
        setSearch(product.productName);
        setShowDropdown(false);
    };

    const handleClear = () => {
        onChange(null, "PERCENT", 0);
        setSearch("");
        setSubmittedSearch("");
        setShowDropdown(false);
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="flex flex-col gap-4">

            {/* Search bar — right aligned */}
            <div className="flex justify-end">
                <div className="relative w-72">
                    <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <SearchIcon width={20} height={20} className="text-gray-400" />
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            if (e.target.value === "") handleClear();
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Tìm sản phẩm"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border-[0.5px] border-tgray5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-colors"
                    />

                    {/* Dropdown */}
                    {showDropdown && (
                        <div className="absolute z-10 top-full mt-1 w-full bg-white border-[0.5px] border-tgray5 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {isFetching && (
                                <p className="px-4 py-3 text-sm text-gray-400">Đang tìm...</p>
                            )}
                            {!isFetching && searchResults.length === 0 && (
                                <p className="px-4 py-3 text-sm text-gray-400">Không tìm thấy sản phẩm.</p>
                            )}
                            {!isFetching && searchResults.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSelect(product)}
                                    className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                >
                                    <Image
                                        src={product.imageURL}
                                        alt={product.productName}
                                        width={36}
                                        height={36}
                                        className="rounded object-cover shrink-0"
                                    />
                                    <span className="text-sm text-gray-700 truncate">{product.productName}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Selected product table */}
            {selectedProduct ? (
                <div className="rounded-lg border-[0.5px] border-tgray5 overflow-hidden">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-tgray9 text-left">
                                <th className="px-4 py-3 font-normal">Sản phẩm</th>
                                <th className="px-4 py-3 font-normal w-48">Loại giảm</th>
                                <th className="px-4 py-3 font-normal w-48">Giá trị giảm</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t border-tgray5">

                                {/* Col 1: Product info */}
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={selectedProduct.imageURL}
                                            alt={selectedProduct.productName}
                                            width={56}
                                            height={56}
                                            className="rounded-lg object-cover shrink-0"
                                        />
                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-medium text-gray-800">{selectedProduct.productName}</p>
                                            <p className="text-xs text-gray-400">Số lượng: {totalQuantity(selectedProduct)}</p>
                                            <p className="text-xs text-gray-400">Giá nhập: {formatPrice(selectedProduct.importPrice)}</p>
                                            <p className="text-xs text-gray-400">Giá bán: {formatPrice(selectedProduct.salePrice)}</p>
                                        </div>
                                    </div>
                                </td>

                                {/* Col 2: Loại giảm — must stay SelectInput */}
                                <td className="px-4 py-3 align-middle">
                                    <SelectInput
                                        label=""
                                        value={discountType}
                                        onChange={(v) => onChange(selectedProductId, v as DiscountType, discountValue)}
                                        options={DISCOUNT_TYPE_OPTIONS}
                                    />
                                </td>

                                {/* Col 3: Giá trị giảm — use TextInput */}
                                <td className="px-4 py-3 align-middle">
                                    <TextInput
                                        label=""
                                        value={formatThousands(discountValue)}
                                        placeHolder="0"
                                        inputType="text"
                                        onChange={(e) => onChange(selectedProductId, discountType, parseFormattedNumber(e.target.value))}
                                    />
                                </td>

                                {/* Clear */}
                                <td className="px-4 py-3 text-center align-middle">
                                    <button onClick={handleClear} className="cursor-pointer">
                                        <TrashIcon width={24} height={24} className="text-red" />
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="rounded-lg border-[0.5px] border-dashed border-tgray5 px-4 py-8 text-center text-sm text-gray-400">
                    Tìm và chọn sản phẩm để áp dụng khuyến mãi
                </div>
            )}
        </div>
    );
}