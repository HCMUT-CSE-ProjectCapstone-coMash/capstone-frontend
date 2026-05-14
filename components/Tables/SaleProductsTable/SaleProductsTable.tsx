"use client";

import { Column } from "@/types/UIType";
import { Table } from "../Table";
import { CartLine, ComboDealResponse } from "@/types/cart";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { LayoutModal } from "../../Modal/LayoutModal";
import { useState } from "react";
import { PromotionSelectModal } from "../../Modal/PromotionSelectModal";
import { ComboSizeModal } from "../../Modal/ComboSizeModal";
import { ProductNameCell } from "./ProductNameCell";
import { SizeCell } from "./SizeCell";
import { QuantityCell } from "./QuantityCell";
import { UnitPriceCell } from "./UnitPriceCell";
import { StockCell } from "./StockCell";
import { DiscountCell } from "./DiscountCell";
import { PromotionCell } from "./PromotionCell";
import { DeleteCell } from "./DeleteCell";

interface SaleProductsTableProps {
    cart: CartLine[];
    setCart: (newCart: CartLine[]) => void;
    isLocked: boolean;
    onQuantityChange: ( lineIndex: number, newQuantity: number ) => void;
    onSizeChange: ( lineIndex: number, newSize: string ) => void;
    onApplyCombo: (lineIndex: number, combo: ComboDealResponse) => void;
    onComboSizeModalClose: (lineIndex: number) => void;
}

export function SaleProductsTable({ cart, setCart, isLocked, onQuantityChange, onSizeChange, onApplyCombo, onComboSizeModalClose } : SaleProductsTableProps) {
    const dispatch = useDispatch();

    // -- Update Product Discount --
    const UpdateDiscount = (lineIndex: number, discount: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (line.kind === "product") {
            updatedCart[lineIndex] = { ...line, discount };
            setCart(updatedCart);
        }
    };

    // -- Remove Product From Cart --
    const RemoveFromCart = (lineIndex: number) => {
        setCart(cart.filter((_, index) => index !== lineIndex));
    };

    // -- Update Combo Slot Quantity -- 
    const UpdateComboSlotQuantity = (lineIndex: number, slotIndex: number, size: string, newQuantity: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (line.kind !== "combo") return;

        const slot = line.itemSlots[slotIndex];
        const sizeEntry = slot.product.quantities.find(q => q.size === size);
        if (!sizeEntry) return;

        // Check stock — account for quantity already used by *other* lines/slots
        const otherUsage = cart.reduce((total, l, i) => {
            if (i === lineIndex) {
                // Same combo line, but exclude THIS slot+size
                if (l.kind !== "combo") return total;
                return total + l.itemSlots.reduce((s, sl, sIdx) => {
                    return s + sl.selectedQuantity.reduce((qs, q) => {
                        if (sl.product.id === slot.product.id && q.size === size && sIdx !== slotIndex) {
                            return qs + q.quantities;
                        }
                        return qs;
                    }, 0);
                }, 0);
            }
            if (l.kind === "product" && l.product.id === slot.product.id && l.selectedSize === size) {
                return total + l.quantity;
            }
            if (l.kind === "combo") {
                return total + l.itemSlots.reduce((s, sl) => {
                    if (sl.product.id !== slot.product.id) return s;
                    const sized = sl.selectedQuantity.find(q => q.size === size);
                    return s + (sized?.quantities ?? 0);
                }, 0);
            }
            return total;
        }, 0);

        const available = sizeEntry.quantities - otherUsage;
        const clamped = Math.max(0, Math.min(newQuantity, available));

        // Also clamp so the slot doesn't exceed requiredQuantity
        const otherSizesInSlot = slot.selectedQuantity.reduce(
            (sum, q) => q.size === size ? sum : sum + q.quantities,
            0
        );
        const remainingCapacity = slot.requiredQuantity - otherSizesInSlot;
        const finalQuantity = Math.min(clamped, remainingCapacity);

        if (finalQuantity < newQuantity) {
            dispatch(addAlert({ type: AlertType.WARNING, message: finalQuantity === remainingCapacity
                    ? `Slot này chỉ cần ${slot.requiredQuantity} sản phẩm`
                    : `Size ${size} chỉ còn ${available} sản phẩm`
            }));
        }

        const updatedSlot = {
            ...slot,
            selectedQuantity: slot.selectedQuantity.map(q =>
                q.size === size ? { ...q, quantities: finalQuantity } : q
            ),
        };

        const updatedItemSlots = [...line.itemSlots];
        updatedItemSlots[slotIndex] = updatedSlot;

        updatedCart[lineIndex] = { ...line, itemSlots: updatedItemSlots };
        setCart(updatedCart);
    }
    
    // -- Get Available Quantity of Product -- 
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
                isLocked={isLocked}
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
                isLocked={isLocked}
            />
        )},
        { title: "Tồn kho", key: "available", render: (line) => (
            <StockCell line={line} cart={cart}/>
        )},
        { title: "Chiết khấu", key: "discount", render: (line, index) => (
            <DiscountCell 
                line={line} 
                lineIndex={index} 
                onDiscountChange={UpdateDiscount}
                isLocked={isLocked}
            />
        )},
        { title: "Khuyến mãi", key: "promotion", render: (line) => (
            <PromotionCell
                line={line} 
                onOpen={() => {
                    setSelectedPromotionLine(line);
                    setIsPromotionModalOpen(true);
                }} 
                isLocked={isLocked}
            />
        )},
        { title: "Xoá", key: "delete", render: (line, index) => (
            <DeleteCell
                line={line} 
                lineIndex={index} 
                onRemove={RemoveFromCart}
                isLocked={isLocked}
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
                        onSlotQuantityChange={UpdateComboSlotQuantity}
                    />
                </LayoutModal>
            )}
        </>
    )
};