"use client";

import { FetchTop5LowStock } from "@/api/products/products";
import { BoxIcon } from "@/public/assets/Icons";
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

function getStockColor(stock: number) {
    if (stock <= 1) return { text: "text-red",       };
    if (stock <= 3) return { text: "text-amber-500", };
    return                 { text: "text-tgray6",    };
}

export function LowStockTable() {
    const { data, isLoading, isError } = useQuery<Product[]>({
        queryKey: ["top-5-low-stock"],
        queryFn: FetchTop5LowStock,
        staleTime: 5 * 60 * 1000,
    });

    const rows = (data ?? []).flatMap(p =>
        p.quantities
            .filter(q => q.quantities <= 3)
            .map(q => ({
                key: `${p.id}-${q.size}`,
                name: p.productName,
                size: q.size,
                stock: q.quantities,
                imageURL: p.imageURL,
            }))
    ).slice(0, 5);

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-tgray05 border border-gray-100 flex items-center justify-center">
                    <BoxIcon width={16} height={16} className="text-tgray5" />
                </div>
                <p className="text-base font-semibold text-tgray9">Sản phẩm sắp hết hàng</p>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 px-1 mb-2">
                <div className="w-10" />
                <p className="text-xs text-tgray5">Sản phẩm</p>
                <p className="text-xs text-tgray5">Tồn</p>
            </div>

            {isError && (
                <p className="text-sm text-red py-4">Không thể tải dữ liệu.</p>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-2 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col">
                    {rows.map(row => {
                        const { text } = getStockColor(row.stock);
                        return (
                            <div
                                key={row.key}
                                className="grid grid-cols-[auto_1fr_auto] gap-x-3 items-center py-2.5 border-b border-gray-100 last:border-b-0 px-1"
                            >
                                {/* Image */}
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-50">
                                    <Image
                                        src={row.imageURL}
                                        placeholder="blur"
                                        blurDataURL="/assets/image/light-pink.png"
                                        alt={row.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                {/* Name + size badge */}
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-sm text-tgray9 truncate">{row.name}</span>
                                    <span className="text-xs text-tgray5">Size {row.size}</span>
                                </div>

                                {/* Stock */}
                                <span className={`text-sm font-semibold tabular-nums ${text}`}>
                                    {row.stock}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}