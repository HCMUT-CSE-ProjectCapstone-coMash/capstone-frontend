"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { ComboDeal } from "@/types/promotion";
import { Product, ProductWithOrderStatus } from "@/types/product";
import { FetchApprovedProductByName } from "@/api/products/products";
import { useDebounce } from "@/hooks/useDebounce";
import { SearchInput } from "@/components/FormInputs/SearchInput";
import { TextInput } from "@/components/FormInputs/TextInput";
import { TrashIcon } from "@/public/assets/Icons";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { pinkPlaceholder } from "@/const/placeholder";

interface ComboTableProps {
    combo: ComboDeal;
    index: number;
    onUpdate: (patch: Partial<ComboDeal>) => void;
    onRemove: () => void;
    isEditable: boolean;
}

export function ComboTable({ combo, index, onUpdate, onRemove, isEditable }: ComboTableProps) {
    const user = useSelector((state: RootState) => state.user);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);

    const { data: products = [] } = useQuery({
        queryKey: ["products", debouncedSearch],
        queryFn: () => FetchApprovedProductByName(debouncedSearch),
        enabled: debouncedSearch.length > 2,
        staleTime: 0,
        gcTime: 0,
    });

    const suggestions = products.map((p: Product) => ({
        label: p.productName,
        value: p.productName,
        data: p,
    }));

    // ── Derived totals ─────────────────────────────────────────────────────────

    const originalTotal = combo.comboItems.reduce(
        (sum, item) => sum + item.product.salePrice * item.quantity,
        0
    );
 
    const importTotal = combo.comboItems.reduce(
        (sum, item) => sum + item.product.importPrice * item.quantity,
        0
    );
 
    const profit = combo.comboPrice - importTotal;

    // ── Handlers ───────────────────────────────────────────────────────────────

    const addProductToCombo = (product: Product) => {
        if (combo.comboItems.some((item) => item.product.id === product.id)) return;
 
        onUpdate({
            comboItems: [...combo.comboItems, { product, quantity: 1 }],
        });
    };
 
    const updateItemQuantity = (productId: string, quantity: number) => {
        onUpdate({
            comboItems: combo.comboItems.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            ),
        });
    };
 
    const removeItem = (productId: string) => {
        onUpdate({
            comboItems: combo.comboItems.filter((item) => item.product.id !== productId),
        });
    };
 
    const handleComboPriceChange = (rawValue: string) => {
        const parsed = parseFormattedNumber(rawValue);
        onUpdate({ comboPrice: Math.max(0, parsed) });
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="rounded-lg border-[0.5px] border-tgray5">
            {/* Header: combo name + remove */}
            <div className="flex items-center justify-between gap-4 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm pt-3 font-semibold text-tgray9 whitespace-nowrap">
                        Combo {index + 1}
                    </span>
                    <div className="flex-1 max-w-sm">
                        <TextInput
                            label=""
                            value={combo.comboName}
                            placeHolder="VD: 1 áo + 1 váy"
                            onChange={(e) => onUpdate({ comboName: e.target.value })}
                            disabled={!isEditable}
                        />
                    </div>
                </div>

                {isEditable && (
                    <button type="button" onClick={onRemove} className="cursor-pointer">
                        <TrashIcon width={24} height={24} className="text-red" />
                    </button>
                )}
            </div>

            {/* Search input for this combo */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-tgray5">
                <p className="text-sm font-normal text-tgray9">Sản phẩm trong combo</p>

                <div className="w-md">
                    <SearchInput<ProductWithOrderStatus>
                        label=""
                        placeHolder="Tìm theo tên sản phẩm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        suggestions={suggestions}
                        isItemDisabled={(item) => item.data.isInPendingOrder}
                        onSuggestionClick={(item) => {
                            addProductToCombo(item.data);
                            setSearch("");
                        }}
                        renderItem={(item) => (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8">
                                        <Image
                                            src={item.data.imageURL}
                                            placeholder="blur"
                                            blurDataURL={pinkPlaceholder}
                                            fill
                                            alt=""
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                                {item.data.isInPendingOrder && <p className="text-sm text-pink">Đang chờ duyệt</p>}
                            </div>
                        )}
                        disabled={!isEditable}
                    />
                </div>
            </div>

            {/* Items table */}
            {combo.comboItems.length > 0 ? (
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-tgray9 text-left border-t border-tgray5">
                            <th className="px-4 py-3 font-normal">Sản phẩm</th>
                            <th className="px-4 py-3 font-normal w-40">Số lượng</th>
                            <th className="px-4 py-3 font-normal w-48">Thành tiền</th>
                            <th className="px-4 py-3 w-15"></th>
                        </tr>
                    </thead>

                    <tbody>
                        {combo.comboItems.map((item) => {
                            const { product } = item;
                            const subtotal = product ? product.salePrice * item.quantity : 0;

                            return (
                                <tr key={product.id} className="border-t border-tgray5 align-middle">
                                    <td className="px-4 py-3">
                                        {product && (
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-20 h-20 shrink-0">
                                                    <Image
                                                        src={product.imageURL}
                                                        placeholder="blur"
                                                        blurDataURL={pinkPlaceholder}
                                                        alt=""
                                                        fill
                                                        className="object-cover rounded"
                                                        unoptimized
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.productName}</p>

                                                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                        {product.quantities.map((quantity) => (
                                                            <div key={quantity.size} className="flex items-center gap-1 text-sm">
                                                                <span className="font-medium">{quantity.size}:</span>
                                                                <span className="text-purple font-bold">{quantity.quantities}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="mt-1 flex gap-4 text-tgray9">
                                                        {user.role === "owner" && (
                                                            <span>Giá nhập: {formatThousands(product.importPrice)} VNĐ</span>
                                                        )}
                                                        <span>Giá bán: {formatThousands(product.salePrice)} VNĐ</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>

                                    <td className="px-4 py-3 w-40">
                                        <TextInput
                                            label=""
                                            value={formatThousands(item.quantity)}
                                            placeHolder="1"
                                            inputType="text"
                                            onChange={(e) =>
                                                updateItemQuantity(product.id, parseFormattedNumber(e.target.value) || 1)
                                            }
                                            disabled={!isEditable}
                                        />
                                    </td>

                                    <td className="px-4 py-3 w-48 text-tgray9">
                                        {formatThousands(subtotal)} VNĐ
                                    </td>

                                    <td className="px-4 pt-4 w-15 text-center">
                                        {isEditable && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(product.id)}
                                                className="cursor-pointer"
                                            >
                                                <TrashIcon width={24} height={24} className="text-red" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-400 border-t border-tgray5">
                    Tìm và chọn sản phẩm để thêm vào combo
                </div>
            )}

            {/* Combo pricing */}
            {combo.comboItems.length > 0 && (
                <div className="flex items-center justify-between gap-4 px-8 py-3 border-t border-tgray5 bg-gray-50">
                    {user.role === "owner" && (
                        <div>
                            <p className="text-sm text-tgray9 mb-1">Tổng giá nhập</p>
                            <div className="py-2 text-sm font-medium">
                                {formatThousands(importTotal)} VNĐ
                            </div>
                        </div>
                    )}

                    <div>
                        <p className="text-sm text-tgray9 mb-1">Tổng giá bán</p>
                        <div className="py-2 text-sm font-medium">
                            {formatThousands(originalTotal)} VNĐ
                        </div>
                    </div>

                    <div className="w-md">
                        <p className="text-sm text-tgray9 mb-1">Giá combo</p>
                        <TextInput
                            label=""
                            value={formatThousands(combo.comboPrice)}
                            placeHolder="0"
                            inputType="text"
                            onChange={(e) => handleComboPriceChange(e.target.value)}
                            disabled={!isEditable}
                        />
                    </div>

                    <div>
                        <p className="text-sm text-tgray9 mb-1">Lợi nhuận</p>
                        {combo.comboPrice > 0 ? (
                            <div className="py-2 text-sm">
                                <span className={`font-bold ${profit >= 0 ? "text-purple" : "text-red"}`}>
                                    {profit >= 0 ? "+" : "-"}{formatThousands(profit)} VNĐ
                                </span>
                            </div>
                        ) : (
                            <div className="py-2 text-sm text-gray-400">—</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}