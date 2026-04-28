"use client";

import Image from "next/image";
import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { LayoutModal } from "../Modal/LayoutModal";
import { Table } from "../Tables/Table";
import { Column } from "@/types/UIType";
import { Badge } from "antd";
import {
    SaleOrderResponse,
    SaleOrderDetailResponse,
    MappedSaleOrder,
    MappedComboPromotion,
    mapSaleOrder,
} from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";
import { PaymentMethod } from "@/const/PaymentMethod";

// ===================== HELPERS =====================

const paymentOptions: { value: string; label: string }[] = [
    { value: PaymentMethod.CASH, label: "Tiền mặt" },
    { value: PaymentMethod.TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.DEBIT, label: "Ghi nợ" },
];

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ===================== ROW TYPE =====================

type ProductRow = { kind: "product"; detail: SaleOrderDetailResponse };
type ComboRow   = { kind: "combo";   combo: MappedComboPromotion };
type TableRow   = ProductRow | ComboRow;

// ===================== COMBO DETAIL MODAL =====================
// Modal read-only riêng cho trang detail, không dùng ComboSizeModal ;;-;;

function ComboDetailModal({ combo }: { combo: MappedComboPromotion }) {
    return (
        <div className="w-120 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-1 pb-3 border-b">
                <p className="text-lg font-semibold text-purple">Chi tiết combo</p>
                <p className="text-sm text-gray-600">{combo.comboName}</p>
            </div>

            <div className="flex flex-col gap-3">
                {combo.items.map((item) => (
                    <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 rounded-lg border border-gray-200"
                    >
                        {/* Ảnh */}
                        <div className="relative w-14 h-14 shrink-0">
                            <Image
                                src={item.imageUrl}
                                placeholder="blur"
                                blurDataURL="/assets/image/light-pink.png"
                                alt=""
                                fill
                                className="object-cover rounded"
                                unoptimized
                            />
                        </div>

                        {/* Tên + size + số lượng */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.productName}</p>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                    {item.selectedSize}
                                </span>
                                <span className="text-xs text-gray-500">x{item.quantity}</span>
                            </div>
                        </div>

                        {/* Đơn giá gốc */}
                        <div className="text-right shrink-0">
                            <p className="text-xs text-gray-400 mb-0.5">Đơn giá gốc</p>
                            <p className="text-sm font-medium">{formatThousands(item.unitPrice)} VNĐ</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer giá combo */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">Giá combo</span>
                <span className="text-sm">
                    {formatThousands(combo.comboPrice)} VNĐ
                </span>
            </div>
        </div>
    );
}

// ===================== CELL COMPONENTS =====================

function ProductNameCell({ row }: { row: TableRow }) {
    if (row.kind === "product") {
        return (
            <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 shrink-0">
                    <Image
                        src={row.detail.imageUrl}
                        placeholder="blur"
                        blurDataURL="/assets/image/light-pink.png"
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
                <p>{row.detail.productName}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-2">
            {row.combo.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0">
                        <Image
                            src={item.imageUrl}
                            placeholder="blur"
                            blurDataURL="/assets/image/light-pink.png"
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    <p>{item.productName}</p>
                </div>
            ))}
        </div>
    );
}

function SizeCell({ row, onOpenComboSize }: { row: TableRow; onOpenComboSize: () => void }) {
    if (row.kind === "product") {
        return <span>{row.detail.selectedSize}</span>;
    }

    return (
        <Badge count={row.combo.items.length}>
            <button
                type="button"
                onClick={onOpenComboSize}
                className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
            >
                Xem
            </button>
        </Badge>
    );
}

function UnitPriceCell({ row }: { row: TableRow }) {
    if (row.kind === "combo") {
        return <span>{formatThousands(row.combo.comboPrice)} VNĐ</span>;
    }
    return <span>{formatThousands(row.detail.unitPrice)} VNĐ</span>;
}

function QuantityCell({ row }: { row: TableRow }) {
    if (row.kind === "combo") return <span>1</span>;
    return <span>{row.detail.quantity}</span>;
}

function DiscountCell({ row }: { row: TableRow }) {
    if (row.kind === "combo") return <span ></span>;
    if (row.detail.discount <= 0) return <span></span>;
    return <span>- {formatThousands(row.detail.discount)}</span>;
}

function PromotionCell({ row }: { row: TableRow }) {
    if (row.kind === "combo") {
        return <span>{row.combo.comboName}</span>;
    }
    if (row.detail.productPromotion) {
        return <span>{row.detail.productPromotion.promotionName}</span>;
    }
    return <span></span>;
}

// ===================== DETAILS TABLE =====================

function DetailsTable({ mapped }: { mapped: MappedSaleOrder }) {
    const [selectedCombo, setSelectedCombo] = useState<MappedComboPromotion | null>(null);

    const rows: TableRow[] = [
        ...mapped.combos.map((combo): TableRow => ({ kind: "combo", combo })),
        ...mapped.products.map((detail): TableRow => ({ kind: "product", detail })),
    ];

    const columns: Column<TableRow>[] = [
        {
            title: "Tên sản phẩm",
            key: "productName",
            render: (row) => <ProductNameCell row={row} />,
        },
        {
            title: "Kích cỡ",
            key: "size",
            render: (row) => (
                <SizeCell
                    row={row}
                    onOpenComboSize={() => {
                        if (row.kind === "combo") setSelectedCombo(row.combo);
                    }}
                />
            ),
        },
        {
            title: "Đơn giá",
            key: "unitPrice",
            render: (row) => <UnitPriceCell row={row} />,
        },
        {
            title: "Số lượng",
            key: "quantity",
            render: (row) => <QuantityCell row={row} />,
        },
        {
            title: "Chiết khấu",
            key: "discount",
            render: (row) => <DiscountCell row={row} />,
        },
        {
            title: "Khuyến mãi",
            key: "promotion",
            render: (row) => <PromotionCell row={row} />,
        },
    ];

    return (
        <>
            <Table columns={columns} data={rows} />

            <LayoutModal
                isOpen={selectedCombo !== null}
                onClose={() => setSelectedCombo(null)}
            >
                {selectedCombo && <ComboDetailModal combo={selectedCombo} />}
            </LayoutModal>
        </>
    );
}

// ===================== MAIN COMPONENT =====================

interface SaleOrderDetailProps {
    saleOrder: SaleOrderResponse;
}

export function SaleOrderDetail({ saleOrder }: SaleOrderDetailProps) {
    const mapped = mapSaleOrder(saleOrder);

 
    // Số tiền khuyến mãi = tổng trước - tổng sau (totalPrice đã bao gồm tất cả giảm giá)
    const totalSaved = saleOrder.originalTotalPrice - saleOrder.totalPrice;

    return (
        <div className="flex flex-col gap-8">
            {/* ── THÔNG TIN ĐƠN HÀNG ── */}
            <div className="flex flex-col gap-5">
                <TextInput
                    disabled
                    label="Mã đơn hàng"
                    placeHolder=""
                    value={saleOrder.saleOrderId}
                    onChange={() => {}}
                />

                <div className="flex items-center gap-5">
                    <div className="w-1/2">
                        <TextInput
                            disabled
                            label="Thời gian bán hàng"
                            placeHolder=""
                            value={formatDateTime(saleOrder.createdAt)}
                            onChange={() => {}}
                        />
                    </div>
                    <div className="w-1/2">
                        <TextInput
                            disabled
                            label="Người bán hàng"
                            placeHolder=""
                            value={saleOrder.createdByName}
                            onChange={() => {}}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="w-1/2">
                        <TextInput
                            disabled
                            label="Khách hàng"
                            placeHolder=""
                            value={saleOrder.customerName ?? "Khách vãng lai"}
                            onChange={() => {}}
                        />
                    </div>
                    <div className="w-1/2">
                        <TextInput
                            disabled
                            label="Số điện thoại"
                            placeHolder=""
                            value={saleOrder.customerPhone ?? ""}
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>

            {/* ── CHI TIẾT SẢN PHẨM ── */}
            <div>
                <p className="text-sm mb-2">Chi tiết sản phẩm</p>
                <DetailsTable mapped={mapped} />
            </div>

            {/* ── TỔNG KẾT ── */}
            <div>
                <p className="text-sm mb-2">Tổng kết</p>
                <div className="text-sm">
                    <div className="flex justify-between px-4 py-3">
                        <span>Tổng tiền</span>
                        <span className="font-semibold">{formatThousands(saleOrder.originalTotalPrice)} VNĐ</span>
                    </div>

                    <div className="flex justify-between px-4 py-3">
                        <span>Khuyến mãi</span>
                        <span className="text-green-600 font-semibold">
                           - {formatThousands(totalSaved)} VNĐ
                        </span>
                    </div>

                    <div className="flex justify-between px-4 py-3">
                        <span>Thành tiền</span>
                        <span className="text-purple font-semibold">
                            {formatThousands(saleOrder.totalPrice)} VNĐ
                        </span>
                    </div>

                    <div className="flex justify-between px-4 py-3">
                        <span>Phương thức thanh toán</span>
                        <span className="font-medium">
                            {paymentOptions.find((opt) => opt.value === saleOrder.paymentMethod)?.label ?? saleOrder.paymentMethod}
                        </span>
                    </div>

                    {saleOrder.debitMoney> 0 && (
                        <div className="flex justify-between px-4 py-3">
                            <span>Số tiền nợ</span>
                            <span className="text-red-600 font-bold">
                                {formatThousands(saleOrder.debitMoney)} VNĐ
                            </span>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}