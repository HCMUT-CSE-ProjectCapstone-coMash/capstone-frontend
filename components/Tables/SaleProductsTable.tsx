"use client";

import { Column } from "@/types/UIType";
import { Table } from "./Table";
import { CartLine, ComboDealResponse } from "@/types/cart";
import Image from "next/image";
import { formatThousands } from "@/utilities/numberFormat";
import { AddIcon, MinusIcon, TrashIcon } from "@/public/assets/Icons";
import { Cell } from "../Cell";
import { SelectInput } from "../FormInputs/SelectInput";
import { Tooltip, Badge } from "antd";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { sizesLetter, sizesNumber } from "@/const/product";
import { LayoutModal } from "../Modal/LayoutModal";
import { useState } from "react";
import { PromotionSelectModal } from "../Modal/PromotionSelectModal";

interface SaleProductsTableProps {
    cart: CartLine[];
    onQuantityChange: ( lineIndex: number, newQuantity: number ) => void;
    onRemove: ( lineIndex: number ) => void;
    onDiscountChange: ( lineIndex: number, newDiscount: number ) => void;
    onSizeChange: ( lineIndex: number, newSize: string ) => void;
    onApplyCombo: (lineIndex: number, combo: ComboDealResponse) => void;
}

const sortSizes = (sizes: string[], sizeType: "Letter" | "Number"): string[] => {
    const ORDER = sizeType === "Letter" ? sizesLetter : sizesNumber;
    return [...sizes].sort((a, b) => {
        const indexA = ORDER.indexOf(a);
        const indexB = ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};

export function SaleProductsTable({ cart, onQuantityChange, onRemove, onDiscountChange, onSizeChange, onApplyCombo } : SaleProductsTableProps) {
    const dispatch = useDispatch();
    
    const getAvailableQuantity = (line: CartLine): number => {
        if (line.kind === "combo") return Infinity;
        return line.product.quantities.find(q => q.size === line.selectedSize)?.quantities ?? 0;
    };

    const [selectedPromotionLine, setSelectedPromotionLine] = useState<CartLine | null>(null);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

    const columns: Column<CartLine>[] = [
        { title: "Tên sản phẩm", key: "productName", render: (line) => (
            <>
                {line.kind === "product" ? (
                    <div className="flex items-center justify-center gap-4">
                        <div className="relative w-12 h-12">
                            <Image src={line.product.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
                        </div>
                        <p>{line.product.productName}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-start gap-2">
                        {line.appliedCombo.comboItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="relative w-12 h-12">
                                    <Image src={item.product.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
                                </div>
                                <p>{item.product.productName}</p>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )},
        { title: "Kích cỡ", key: "size", render: (line) => (
            <>
                {line.kind === "product" ? (
                    <div className="w-16 mx-auto">
                        <SelectInput
                            label=""
                            options={
                                line.kind === "product"
                                    ? sortSizes(
                                        line.product.quantities.map((q) => q.size),
                                        line.product.sizeType
                                        ).map((size) => ({ label: size, value: size }))
                                    : []
                            }                    
                            value={line.kind === "product" ? line.selectedSize : ""}
                            onChange={(value) => onSizeChange(cart.indexOf(line), value)}
                            noDefaultOption={true}
                        />
                    </div>
                ) : (
                    <div>
                        <button
                            className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                            type="button"
                            onClick={() => {}}
                        >
                            Xem
                        </button>
                    </div>
                )}
            </>
        )},
        { title: "Đơn giá", key: "unitPrice", render: (line) => (
            <UnitPriceCell line={line} />
        )},        
        { title: "Số lượng", key: "quantity", render: (line) => {
            const available = getAvailableQuantity(line);
            return (
                <div className="flex items-center justify-center gap-4">
                    <button 
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => {
                            if (line.quantity - 1 <= 0) {
                                onQuantityChange(cart.indexOf(line), line.quantity - 1);
                                dispatch(addAlert({ type: AlertType.WARNING, message: "Đã xoá sản phẩm khỏi giỏ hàng" }));
                            } else {
                                onQuantityChange(cart.indexOf(line), line.quantity - 1);
                                dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã giảm số lượng" }));
                            }
                        }}
                    >
                        <MinusIcon width={24} height={24} className=""/>
                    </button>
                    <p>{line.quantity}</p>
                    <button 
                        className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => {
                            if (line.quantity < available) {
                                onQuantityChange(cart.indexOf(line), line.quantity + 1)
                                dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật số lượng thành công" }));
                            } else {
                                dispatch(addAlert({ type: AlertType.WARNING, message: `Số lượng tối đa là ${available}` }));
                            }
                        }}
                    >
                        <AddIcon width={24} height={24} className=""/>
                    </button>
                </div>
            );
        }},
        { title: "Chiết khấu", key: "discount", render: (line) => (
            <>
                {line.kind === "product" ? (
                    <Cell
                        isPercentage={true}
                        value={line.discount}
                        onSave={(value) => {
                            if (value < 0 || value > 100) {
                                dispatch(addAlert({ type: AlertType.WARNING, message: "Chiết khấu phải từ 0% đến 100%" }));
                                return;
                            }
                            onDiscountChange(cart.indexOf(line), value);
                            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã cập nhật chiết khấu thành ${value}%` }));
                        }}        
                    />
                ) : (
                    <div></div>
                )}
            </>
        )},
        { title: "Khuyến mãi", key: "promotion", render: (line) => {
            if (line.kind === "combo") return (
                <span className="text-purple font-semibold">{line.appliedCombo.comboName}</span>
            );

            const count = line.availableCombos.length;

            return (
                <Badge
                    count={count}
                >
                    <button
                        className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                        type="button"
                        onClick={() => {
                            setSelectedPromotionLine(line);
                            setIsPromotionModalOpen(true);
                        }}
                    >
                        Xem
                    </button>
                </Badge>
            );
        }},
        { title: "Xoá", key: "delete", render: (line) => (
            <button
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => {
                    onRemove(cart.indexOf(line));
                    const name = line.kind === "product" ? line.product.productName : line.appliedCombo.comboName;
                    dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã xoá "${name}" khỏi giỏ hàng` }));
                }}
            >
                <TrashIcon width={24} height={24} className={"text-red-500"}/>
            </button>
        )}
    ];

    return (
        <>
            <Table
                columns={columns}
                data={cart}
            />

            {selectedPromotionLine && (
                <LayoutModal
                    isOpen={isPromotionModalOpen}
                    onClose={() => setIsPromotionModalOpen(false)}
                >
                    <PromotionSelectModal 
                        line={selectedPromotionLine}
                        onApplyCombo={(combo) => {
                            onApplyCombo(cart.indexOf(selectedPromotionLine), combo);
                            setIsPromotionModalOpen(false);
                            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã áp dụng combo "${combo.comboName}"` }));
                        }}
                    />
                </LayoutModal>
            )}
        </>
    )
}

// -- Component for rendering unit price with promotion and discount details in tooltip --
function UnitPriceCell({ line }: { line: CartLine }) {
    if (line.kind === "combo") {
        return <span>{formatThousands(line.appliedCombo.comboPrice)} VNĐ</span>;
    }

    const basePrice = line.product.salePrice;

    const promotionPrice = line.appliedPromotion
        ? line.appliedPromotion.discountType === "Percent"
            ? basePrice * (1 - line.appliedPromotion.discountValue / 100)
            : basePrice - line.appliedPromotion.discountValue
        : basePrice;

    const finalPrice = Math.round(promotionPrice * (1 - line.discount / 100));
    const hasAnyDiscount = !!line.appliedPromotion || line.discount > 0;

    const tooltipContent = (
        <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between gap-6">
                <span className="text-white/60">Giá gốc</span>
                <span>{formatThousands(basePrice)} VNĐ</span>
            </div>
            {line.appliedPromotion && (
                <>
                    <div className="flex justify-between gap-6 text-orange-400">
                        <span>
                            Khuyến mãi ({line.appliedPromotion.discountType === "Percent"
                                ? `-${line.appliedPromotion.discountValue}%`
                                : `-${formatThousands(line.appliedPromotion.discountValue)} VNĐ`})
                        </span>
                        <span>-{formatThousands(basePrice - promotionPrice)} VNĐ</span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className="text-white/60">Sau KM</span>
                        <span>{formatThousands(promotionPrice)} VNĐ</span>
                    </div>
                </>
            )}
            {line.discount > 0 && (
                <>
                    <div className="flex justify-between gap-6 text-blue-400">
                        <span>Chiết khấu (-{line.discount}%)</span>
                        <span>-{formatThousands(promotionPrice - finalPrice)} VNĐ</span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className="text-white/60">Sau CK</span>
                        <span>{formatThousands(finalPrice)} VNĐ</span>
                    </div>
                </>
            )}
            <div className="flex justify-between gap-6 border-t border-white/30 pt-1 font-bold">
                <span>Thành tiền</span>
                <span>{formatThousands(finalPrice)} VNĐ</span>
            </div>
        </div>
    );

    return (
        <Tooltip title={hasAnyDiscount ? tooltipContent : null}>
            <div className="flex flex-col items-center gap-1 cursor-default">
                {hasAnyDiscount && (
                    <span className="text-gray-400 line-through text-sm">
                        {formatThousands(basePrice)} VNĐ
                    </span>
                )}
                <span className={hasAnyDiscount ? "text-purple font-bold" : ""}>
                    {formatThousands(finalPrice)} VNĐ
                </span>
            </div>
        </Tooltip>
    );
}