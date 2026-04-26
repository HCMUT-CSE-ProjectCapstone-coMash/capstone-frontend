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
import { ComboSizeModal } from "../Modal/ComboSizeModal";
import { Product } from "@/types/product";

interface SaleProductsTableProps {
    cart: CartLine[];
    onQuantityChange: ( lineIndex: number, newQuantity: number ) => void;
    onRemove: ( lineIndex: number ) => void;
    onDiscountChange: ( lineIndex: number, newDiscount: number ) => void;
    onSizeChange: ( lineIndex: number, newSize: string ) => void;
    onApplyCombo: (lineIndex: number, combo: ComboDealResponse) => void;
    onComboSlotQuantityChange: (lineIndex: number, slotIndex: number, size: string, newQuantity: number) => void;
    onComboSizeModalClose: (lineIndex: number) => void;
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

export function SaleProductsTable({ cart, onQuantityChange, onRemove, onDiscountChange, onSizeChange, onApplyCombo, onComboSlotQuantityChange, onComboSizeModalClose } : SaleProductsTableProps) {
    const dispatch = useDispatch();
    
    const getAvailableQuantity = (line: CartLine): number => {
        if (line.kind === "product") {
            return line.product.quantities.find(q => q.size === line.selectedSize)?.quantities ?? 0;
        }
        
        const lineIndex = cart.indexOf(line);
        let maxCombos = Infinity;

        for (let slotIdx = 0; slotIdx < line.itemSlots.length; slotIdx++) {
            const slot = line.itemSlots[slotIdx];
            const perComboReq = line.appliedCombo.comboItems[slotIdx].quantity;
            const totalStock = slot.product.quantities.reduce((s, q) => s + q.quantities, 0);
    
            const otherUsage = cart.reduce((total, l, i) => {
                if (i === lineIndex) return total;
                if (l.kind === "product" && l.product.id === slot.product.id) {
                    return total + l.quantity;
                }
                if (l.kind === "combo") {
                    return total + l.itemSlots.reduce((s, sl) => {
                        if (sl.product.id !== slot.product.id) return s;
                        const filled = sl.selectedQuantity.reduce((qs, q) => qs + q.quantities, 0);
                        const unfilled = Math.max(0, sl.requiredQuantity - filled);
                        return s + filled + unfilled;
                    }, 0);
                }
                return total;
            }, 0);
            
            const availForSlot = totalStock - otherUsage;
            const maxForSlot = Math.floor(availForSlot / perComboReq);
            maxCombos = Math.min(maxCombos, maxForSlot);
        }

        return Math.max(0, maxCombos);
    };

    const [selectedPromotionLine, setSelectedPromotionLine] = useState<CartLine | null>(null);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

    const [selectedComboLineIndex, setSelectedComboLineIndex] = useState<number | null>(null);
    const [isComboSizeModalOpen, setIsComboSizeModalOpen] = useState(false);

    const columns: Column<CartLine>[] = [
        { title: "Tên sản phẩm", key: "productName", render: (line) => (
            <ProductNameCell line={line}/>
        )},
        { title: "Kích cỡ", key: "size", render: (line, index) => (
            <SizeCell 
                line={line} 
                lineIndex={index} 
                onSizeChange={onSizeChange} 
                onOpenComboSize={() => {
                    setSelectedComboLineIndex(index);
                    setIsComboSizeModalOpen(true);
                }}
            />
        )},
        { title: "Đơn giá", key: "unitPrice", render: (line) => (
            <UnitPriceCell line={line} />
        )},        
        { title: "Số lượng", key: "quantity", render: (line, index) => (
            <QuantityCell 
                line={line} 
                lineIndex={index} 
                availableQuantity={getAvailableQuantity(line)} 
                onQuantityChange={onQuantityChange}
                dispatch={dispatch}
            />
        )},
        { title: "Tồn kho", key: "available", render: (line) => (
            <StockCell line={line} cart={cart}/>
        )},
        { title: "Chiết khấu", key: "discount", render: (line, index) => (
            <DiscountCell 
                line={line} 
                lineIndex={index} 
                onDiscountChange={onDiscountChange} 
                dispatch={dispatch}
            />
        )},
        { title: "Khuyến mãi", key: "promotion", render: (line) => (
            <PromotionCell 
                line={line} 
                onOpen={() => {
                    setSelectedPromotionLine(line);
                    setIsPromotionModalOpen(true);
                }} 
            />
        )},
        { title: "Xoá", key: "delete", render: (line, index) => (
            <DeleteCell 
                line={line} 
                lineIndex={index} 
                onRemove={onRemove} 
                dispatch={dispatch}
            />
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

            {selectedComboLineIndex !== null && cart[selectedComboLineIndex]?.kind === "combo" && (
                <LayoutModal 
                    isOpen={isComboSizeModalOpen} 
                    onClose={() => {
                        if (selectedComboLineIndex !== null) {
                            onComboSizeModalClose(selectedComboLineIndex);
                        }
                        setIsComboSizeModalOpen(false);
                        setSelectedComboLineIndex(null);
                    }}
                >
                    <ComboSizeModal 
                        line={cart[selectedComboLineIndex]}
                        lineIndex={selectedComboLineIndex}
                        onSlotQuantityChange={onComboSlotQuantityChange}
                    />
                </LayoutModal>
            )}
        </>
    )
}

// -- Component for rendering product name --
function ProductNameCell({ line }: { line: CartLine }) {
    if (line.kind === "product") {
        return (
            <div className="flex items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                    <Image src={line.product.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
                </div>
                <p>{line.product.productName}</p>
            </div>
        );
    }

    return (
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
    );
}

// -- Component for rendering size selector --
interface SizeCellProps {
    line: CartLine;
    onSizeChange: (lineIndex: number, newSize: string) => void;
    lineIndex: number;
    onOpenComboSize: () => void;
}

function SizeCell({ line, onSizeChange, lineIndex, onOpenComboSize }: SizeCellProps) {
    if (line.kind === "product") {
        return (
            <div className="w-16 mx-auto">
                <SelectInput
                    label=""
                    options={sortSizes(line.product.quantities.map((q) => q.size), line.product.sizeType).map((size) => ({ label: size, value: size }))}
                    value={line.selectedSize}
                    onChange={(value) => onSizeChange(lineIndex, value)}
                    noDefaultOption={true}
                />
            </div>
        );
    }

    const missingCount = line.itemSlots.reduce((sum, slot) => {
        const selectedTotal = slot.selectedQuantity.reduce((s, q) => s + q.quantities, 0);
        const diff = slot.requiredQuantity - selectedTotal;
        return sum + Math.max(diff, 0);
    }, 0);

    return (
        <Badge count={missingCount}>
            <button
                className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                type="button"
                onClick={onOpenComboSize}
            >
                Xem
            </button>
        </Badge>
    );
}

// -- Component for rendering quantity controls --
interface QuantityCellProps {
    line: CartLine;
    lineIndex: number;
    availableQuantity: number;
    onQuantityChange: (lineIndex: number, newQuantity: number) => void;
    dispatch: ReturnType<typeof useDispatch>;
}

function QuantityCell({ line, lineIndex, availableQuantity, onQuantityChange, dispatch }: QuantityCellProps) {
    return (
        <div className="flex items-center justify-center gap-4">
            <button
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => {
                    onQuantityChange(lineIndex, line.quantity - 1);
                    if (line.quantity - 1 <= 0) {
                        dispatch(addAlert({ type: AlertType.WARNING, message: "Đã xoá sản phẩm khỏi giỏ hàng" }));
                    } else {
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
                    if (line.quantity < availableQuantity) {
                        onQuantityChange(lineIndex, line.quantity + 1);
                        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật số lượng thành công" }));
                    } else {
                        dispatch(addAlert({ type: AlertType.WARNING, message: `Số lượng tối đa là ${availableQuantity}` }));
                    }
                }}
            >
                <AddIcon width={24} height={24} className=""/>
            </button>
        </div>
    );
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

// -- Component for rendering stock with cart-aware remaining quantities --
const getRemainingStock = (cart: CartLine[], productId: string, size: string, totalStock: number): number => {
    const used = cart.reduce((total, line) => {
        if (line.kind === "product") {
            if (line.product.id === productId && line.selectedSize === size) {
                return total + line.quantity;
            }
            return total;
        }

        return total + line.itemSlots.reduce((slotSum, slot) => {
            if (slot.product.id !== productId) return slotSum;
            const sizeQty = slot.selectedQuantity.find(q => q.size === size);
            return slotSum + (sizeQty?.quantities ?? 0);
        }, 0);
    }, 0);

    return totalStock - used;
};

function StockCell({ line, cart }: { line: CartLine; cart: CartLine[] }) {
    if (line.kind === "product") {
        return (
            <div className="flex flex-col items-center">
                <ProductStockList product={line.product} cart={cart} />
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center gap-3">
            {line.itemSlots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-500 truncate mb-1">
                        {slot.product.productName}
                    </p>
                    <ProductStockList product={slot.product} cart={cart} />
                </div>
            ))}
        </div>
    );
}

function ProductStockList({ product, cart }: { product: Product; cart: CartLine[] }) {
    const sortedSizes = sortSizes(
        product.quantities.map((q) => q.size),
        product.sizeType
    );

    const stockBySize = sortedSizes.map((size) => {
        const sizeEntry = product.quantities.find((q) => q.size === size)!;
        return {
            size,
            remaining: getRemainingStock(cart, product.id, size, sizeEntry.quantities),
        };
    });

    const hasAnyStock = stockBySize.some((s) => s.remaining > 0);

    if (!hasAnyStock) {
        return <span className="text-sm text-red-500 font-medium">Hết hàng</span>;
    }

    return (
        <>
            {stockBySize.map(({ size, remaining }) =>
                remaining > 0 ? (
                    <div key={size} className="flex justify-center items-center gap-2 text-sm">
                        <span className="font-medium">{size}:</span>
                        <span className="text-purple font-bold">{remaining}</span>
                    </div>
                ) : null
            )}
        </>
    );
}

// -- Component for rendering discount cell --
type DiscountCellProps = {
    line: CartLine;
    lineIndex: number;
    onDiscountChange: (lineIndex: number, discount: number) => void;
    dispatch: ReturnType<typeof useDispatch>;
}

function DiscountCell({ line, lineIndex, onDiscountChange, dispatch }: DiscountCellProps) {
    if (line.kind !== "product") return <div></div>;

    return (
        <Cell
            isPercentage={true}
            value={line.discount}
            onSave={(value) => {
                if (value < 0 || value > 100) {
                    dispatch(addAlert({ type: AlertType.WARNING, message: "Chiết khấu phải từ 0% đến 100%" }));
                    return;
                }
                onDiscountChange(lineIndex, value);
                dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã cập nhật chiết khấu thành ${value}%` }));
            }}
        />
    );
}

// -- Component for rendering promotion button --
function PromotionCell({ line, onOpen }: { line: CartLine; onOpen: (line: CartLine) => void; }) {
    if (line.kind === "combo") {
        return <span className="text-purple font-semibold">{line.appliedCombo.comboName}</span>;
    }

    return (
        <Badge count={line.availableCombos.length}>
            <button
                className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer"
                type="button"
                onClick={() => onOpen(line)}
            >
                Xem
            </button>
        </Badge>
    );
}

// -- Component for rendering delete button --
type DeleteCellProps = {
    line: CartLine;
    lineIndex: number;
    onRemove: (lineIndex: number) => void;
    dispatch: ReturnType<typeof useDispatch>;
}

function DeleteCell({ line, lineIndex, onRemove, dispatch }: DeleteCellProps) {

    return (
        <button
            className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => {
                onRemove(lineIndex);
                const name = line.kind === "product" ? line.product.productName : line.appliedCombo.comboName;
                dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã xoá "${name}" khỏi giỏ hàng` }));
            }}
        >
            <TrashIcon width={24} height={24} className={"text-red-500"}/>
        </button>
    );
}