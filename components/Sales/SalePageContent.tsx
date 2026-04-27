"use client";

import { Product, ProductQuantity, ProductWithOrderStatus } from "@/types/product";
import { SearchInput } from "../FormInputs/SearchInput";
import { SaleProductsTable } from "../Tables/SaleProductsTable";
import { useState } from "react";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FetchApprovedProductByName } from "@/api/products/products";
import { GetPromotionsByProductId } from "@/api/promotions/promotions";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { AppliedProductDiscount, CartLine, ComboDealResponse, ComboCartLine, ProductCartLine, PromotionsResponse } from "@/types/cart";
import { InvoiceForm } from "../Forms/InvoiceForm";

export function SalePageContent() {
    const dispatch = useDispatch();

    const [cart, setCart] = useState<CartLine[]>([]);
    const [knownCombos, setKnownCombos] = useState<Map<string, ComboDealResponse>>(new Map());

    const [isOrderComplete, setIsOrderComplete] = useState(false);

    const handleOrderComplete = () => setIsOrderComplete(true);

    const handleReset = () => {
        setCart([]);
        setKnownCombos(new Map());
        setIsOrderComplete(false);
    };

    // -- Search product ----------------------------------------------------------------------
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedName = useDebounce(searchTerm, 500);

    const { data: products = [] } = useQuery({
        queryKey: ["products", debouncedName],
        queryFn: () => FetchApprovedProductByName(debouncedName),
        enabled: debouncedName.length > 2,
        staleTime: 0,
        gcTime: 0
    });

    const suggestions = products.map((p: ProductWithOrderStatus) => ({
        label: p.productName,
        value: p.productName,
        data: p
    }));

    // -- Search Promotions -------------------------------------------------------------------
    const searchPromotionsMutation = useMutation({
        mutationKey: ["get-promotions"],
        mutationFn: (productId: string) => GetPromotionsByProductId(productId),
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể lấy thông tin khuyến mãi của sản phẩm" }));
        }
    });

    // -- Cart and Size Checker -------------------------------------------------------------------
    const getCurrentCartQuantity = (productId: string, size: string) => {
        return cart.reduce((total, line) => {
            if (line.kind === "product") {
                if (line.product.id === productId && line.selectedSize === size) {
                    return total + line.quantity;
                }
                return total;
            }

            return total + line.itemSlots.reduce((slotSum, slot) => {
                if (slot.product.id !== productId) return slotSum;
    
                const filledForThisSize = slot.selectedQuantity.find(q => q.size === size)?.quantities ?? 0;
                const filledTotal = slot.selectedQuantity.reduce((s, q) => s + q.quantities, 0);
                const unfilledCapacity = Math.max(0, slot.requiredQuantity - filledTotal);
    
                return slotSum + filledForThisSize + unfilledCapacity;
            }, 0);
        }, 0);
    };

    const getAvailableSize = (product: Product): string | null => {
        for (const sizeEntry of product.quantities) {
            const currentQtyInCart = getCurrentCartQuantity(product.id, sizeEntry.size);
            if (sizeEntry.quantities - currentQtyInCart > 0) {
                return sizeEntry.size;
            }
        }
        return null;
    };
 
    // -- Utility to build initial slot quantities for combo items --------------------------------
    const buildInitialSlotQuantities = (product: Product): ProductQuantity[] =>
        product.quantities.map(q => ({ ...q, quantities: 0 }));

    // -- Combo Optimization ------------------------------------------------------------------
    const flattenToProducts = (currentCart: CartLine[]): ProductCartLine[] => {
        const pool: Map<string, ProductCartLine> = new Map();
    
        for (const line of currentCart) {
            if (line.kind === "product") {
                const key = `${line.product.id}-${line.selectedSize}`;
                const existing = pool.get(key);
                if (existing) {
                    pool.set(key, { ...existing, quantity: existing.quantity + line.quantity });
                } else {
                    pool.set(key, { ...line });
                }
            } else {
                for (const slot of line.itemSlots) {
                    const selectedSize = getAvailableSize(slot.product) ?? slot.product.quantities[0]?.size ?? ""
                    const key = `${slot.product.id}-${selectedSize}`;
                    const existing = pool.get(key);
                    if (existing) {
                        pool.set(key, { ...existing, quantity: existing.quantity + slot.requiredQuantity });
                    } else {
                        pool.set(key, {
                            kind: "product",
                            product: slot.product,
                            selectedSize: selectedSize,
                            quantity: slot.requiredQuantity,
                            discount: 0,
                            availableCombos: [],
                        });
                    }
                }    
            }
        }
    
        return Array.from(pool.values());
    };

    const getComboSavings = (combo: ComboDealResponse): number => {
        const original = combo.comboItems.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
        return original - combo.comboPrice;
    };

    const optimizeCombos = (currentCart: CartLine[], allCombos: ComboDealResponse[], knownCombosMap: Map<string, ComboDealResponse>): CartLine[] => {
        const pool = flattenToProducts(currentCart);

        const existingComboQueues = new Map<string, ComboCartLine[]>();
        for (const line of currentCart) {
            if (line.kind !== "combo") continue;
            const queue = existingComboQueues.get(line.appliedCombo.id) ?? [];
            queue.push(line);
            existingComboQueues.set(line.appliedCombo.id, queue);
        }

        const bestResult = { savings: 0, combos: [] as ComboDealResponse[] };

        const trySubsets = (index: number, chosen: ComboDealResponse[], remaining: ProductCartLine[]) => {
            const savings = chosen.reduce((sum, c) => sum + getComboSavings(c), 0);
            if (savings > bestResult.savings) {
                bestResult.savings = savings;
                bestResult.combos = [...chosen];
            }

            for (let i = index; i < allCombos.length; i++) {
                const combo = allCombos[i];
                const canForm = combo.comboItems.every(item => {
                    const total = remaining.reduce((sum, p) => p.product.id === item.product.id ? sum + p.quantity : sum, 0);
                    return total >= item.quantity;
                });

                if (!canForm) continue;

                const newRemaining = remaining.map(p => ({ ...p }));
                for (const item of combo.comboItems) {
                    let needed = item.quantity;
                    for (const p of newRemaining) {
                        if (p.product.id !== item.product.id || needed <= 0) continue;
                        const deducted = Math.min(p.quantity, needed);
                        p.quantity -= deducted;
                        needed -= deducted;
                    }
                }

                trySubsets(i + 1, [...chosen, combo], newRemaining);
            }
        };

        // Start the recursive search with a fresh copy of the pool to avoid mutation issues
        trySubsets(0, [], pool.map(p => ({ ...p })));

        const resultCart: CartLine[] = [];
        const remaining = pool.map(p => ({ ...p }));

        // Apply the best combos found
        for (const combo of bestResult.combos) {
            for (const item of combo.comboItems) {
                let needed = item.quantity;
                for (const p of remaining) {
                    if (p.product.id !== item.product.id || needed <= 0) continue;
                    const deducted = Math.min(p.quantity, needed);
                    p.quantity -= deducted;
                    needed -= deducted;
                }
            }

            const existingLine = existingComboQueues.get(combo.id)?.shift();

            resultCart.push({
                kind: "combo",
                appliedCombo: combo,
                quantity: 1,
                itemSlots: existingLine
                    ? existingLine.itemSlots
                    : combo.comboItems.map(item => ({
                        product: item.product,
                        requiredQuantity: item.quantity,
                        selectedQuantity: buildInitialSlotQuantities(item.product),
                    })),
            });
        }

        // Add back any remaining products that weren't included in combos
        for (const p of remaining) {
            if (p.quantity > 0) {
                const availableCombos = [...knownCombosMap.values()].filter(combo =>
                    combo.comboItems.some(item => item.product.id === p.product.id)
                );
                resultCart.push({ ...p, availableCombos });
            }
        }
    
        return resultCart;    
    };

    // -- Cart Handler ------------------------------------------------------------------------
    const AddToCart = (product: Product, selectedSize: string, availableCombos: ComboDealResponse[], appliedPromotion?: AppliedProductDiscount) => {
        const existingLineIndex = cart.findIndex(
            line => line.kind === "product" && line.product.id === product.id && line.selectedSize === selectedSize
        );

        let newCart: CartLine[];

        if (existingLineIndex >= 0) {
            const updatedCart = [...cart];
            const existingLine = updatedCart[existingLineIndex] as ProductCartLine;
            updatedCart[existingLineIndex] = { ...existingLine, quantity: existingLine.quantity + 1 };
            newCart = updatedCart;
        } else {
            newCart = [...cart, {
                kind: "product",
                product,
                selectedSize,
                quantity: 1,
                discount: 0,
                appliedPromotion,
                availableCombos
            }];
        }

        // Lưu các combo đã biết mới vào state để sử dụng cho tối ưu hóa sau này
        const updatedKnownCombos = new Map(knownCombos);
        for (const combo of availableCombos) updatedKnownCombos.set(combo.id, combo);
        setKnownCombos(updatedKnownCombos);

        // Tối ưu hóa combo mỗi khi có sự thay đổi trong giỏ hàng, dựa trên tất cả combo đã biết
        const allCombos = [...updatedKnownCombos.values()];
        const finalCart = allCombos.length > 0 ? optimizeCombos(newCart, allCombos, updatedKnownCombos) : newCart;

        // Notify if a new combo was applied
        const prevComboIds = cart.filter(l => l.kind === "combo").map(l => (l as ComboCartLine).appliedCombo.id);
        const nextComboIds = finalCart.filter(l => l.kind === "combo").map(l => (l as ComboCartLine).appliedCombo.id);
        const newComboId = nextComboIds.find(id => !prevComboIds.includes(id));
        if (newComboId) {
            const comboName = updatedKnownCombos.get(newComboId)?.comboName;
            dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã tự động áp dụng combo "${comboName}"` }));
        }

        setCart(finalCart);
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã thêm sản phẩm vào giỏ hàng" }));
    };

    const UpdateQuantity = (lineIndex: number, newQuantity: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];
    
        let newCart: CartLine[];
        let skipOptimize = false;
    
        if (newQuantity <= 0) {
            newCart = updatedCart.filter((_, index) => index !== lineIndex);
        } else if (line.kind === "combo"){
            const updatedItemSlots = line.itemSlots.map((slot, slotIdx) => {
                const perComboReq = line.appliedCombo.comboItems[slotIdx].quantity;
                const newRequiredQuantity = perComboReq * newQuantity;

                const totalSelected = slot.selectedQuantity.reduce((sum, q) => sum + q.quantities, 0);
                let updatedSelectedQuantity = slot.selectedQuantity;

                if (totalSelected > newRequiredQuantity) {
                    let excess = totalSelected - newRequiredQuantity;
                    updatedSelectedQuantity = slot.selectedQuantity.map(q => {
                        if (excess <= 0) return q;
                        const reduction = Math.min(q.quantities, excess);
                        excess -= reduction;
                        return { ...q, quantities: q.quantities - reduction };
                    });
                }

                return { ...slot, requiredQuantity: newRequiredQuantity, selectedQuantity: updatedSelectedQuantity };
            });

            updatedCart[lineIndex] = { ...line, quantity: newQuantity, itemSlots: updatedItemSlots };
            newCart = updatedCart;
            skipOptimize = true; 
        } else {
            updatedCart[lineIndex] = { ...line, quantity: newQuantity };
            newCart = updatedCart;
        }
    
        const allCombos = [...knownCombos.values()];
        const finalCart = (!skipOptimize && allCombos.length > 0) ? optimizeCombos(newCart, allCombos, knownCombos) : newCart;

        setCart(finalCart);
    };

    const RemoveFromCart = (lineIndex: number) => {
        setCart(cart.filter((_, index) => index !== lineIndex));
    };

    const UpdateDiscount = (lineIndex: number, discount: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (line.kind === "product") {
            updatedCart[lineIndex] = { ...line, discount };
            setCart(updatedCart);
        }
    };

    const UpdateSize = (lineIndex: number, newSize: string) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (line.kind !== "product") return;

        const sizeEntry = line.product.quantities.find(q => q.size === newSize);
        if (!sizeEntry) return;

        const otherCartQty = cart.reduce((total, l, i) => {
            if (i !== lineIndex && l.kind === "product" && l.product.id === line.product.id && l.selectedSize === newSize) {
                return total + l.quantity;
            }
            return total;
        }, 0);

        const available = sizeEntry.quantities - otherCartQty;

        if (available <= 0) {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Size này đã hết hàng" }));
            return;
        }

        const existingLineIndex = cart.findIndex(
            (l, i) => i !== lineIndex && l.kind === "product" && l.product.id === line.product.id && l.selectedSize === newSize
        );

        if (existingLineIndex >= 0) {
            const existingLine = updatedCart[existingLineIndex] as ProductCartLine;
            const mergedQuantity = Math.min(existingLine.quantity + line.quantity, available + existingLine.quantity);
            updatedCart[existingLineIndex] = { ...existingLine, quantity: mergedQuantity };
            setCart(updatedCart.filter((_, i) => i !== lineIndex));
        } else {
            const clampedQuantity = Math.min(line.quantity, available);
            updatedCart[lineIndex] = { ...line, selectedSize: newSize, quantity: clampedQuantity };
            setCart(updatedCart);
        }

        dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã đổi size thành ${newSize}` }));
    };

    const ApplyCombo = (lineIndex: number, combo: ComboDealResponse) => {
        const updatedCart = [...cart];
        updatedCart[lineIndex] = {
            kind: "combo",
            appliedCombo: combo,
            quantity: 1,
            itemSlots: combo.comboItems.map((item) => ({
                product: item.product,
                requiredQuantity: item.quantity,
                selectedQuantity: buildInitialSlotQuantities(item.product),
            })),
        };
        setCart(updatedCart);
    };
    
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
            dispatch(addAlert({
                type: AlertType.WARNING,
                message: finalQuantity === remainingCapacity
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

    const MergeDuplicateComboLines = (lineIndex: number) => {
        const line = cart[lineIndex];
        if (!line || line.kind !== "combo") return;
    
        const otherIndices: number[] = [];
        cart.forEach((l, i) => {
            if (i !== lineIndex && l.kind === "combo" && l.appliedCombo.id === line.appliedCombo.id) {
                otherIndices.push(i);
            }
        });
    
        if (otherIndices.length === 0) return;
    
        const otherLines = otherIndices.map(i => cart[i] as ComboCartLine);
        const mergedQuantity = line.quantity + otherLines.reduce((s, l) => s + l.quantity, 0);
    
        const mergedItemSlots = line.itemSlots.map((slot, slotIdx) => {
            const perComboReq = line.appliedCombo.comboItems[slotIdx].quantity;
            return {
                ...slot,
                requiredQuantity: perComboReq * mergedQuantity,
                selectedQuantity: slot.selectedQuantity.map(q => {
                    const sumFromOthers = otherLines.reduce((sum, ol) => {
                        const found = ol.itemSlots[slotIdx].selectedQuantity.find(oq => oq.size === q.size);
                        return sum + (found?.quantities ?? 0);
                    }, 0);
                    return { ...q, quantities: q.quantities + sumFromOthers };
                }),
            };
        });
    
        const updatedCart = [...cart];
        updatedCart[lineIndex] = { ...line, quantity: mergedQuantity, itemSlots: mergedItemSlots };
        const finalCart = updatedCart.filter((_, i) => !otherIndices.includes(i));
    
        setCart(finalCart);
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã gộp combo cùng loại" }));
    };

    // -- Promotion Helper --------------------------------------------------------------------
    const findBestProductPromotion = (data: PromotionsResponse, product: Product): AppliedProductDiscount | undefined => {
        const candidates: AppliedProductDiscount[] = [];

        for (const promotion of data.productPromotions) {
            const discountItem = promotion.productDiscounts.find(item => item.product.id === product.id);
            if (discountItem) {
                candidates.push({
                    id: discountItem.id,
                    discountType: discountItem.discountType,
                    discountValue: discountItem.discountValue,
                });
            }
        }

        if (candidates.length === 0) return undefined;

        return candidates.reduce((best, current) => {
            const savedBest = best.discountType === "Percent"
                ? product.salePrice * (best.discountValue / 100)
                : best.discountValue;

            const savedCurrent = current.discountType === "Percent"
                ? product.salePrice * (current.discountValue / 100)
                : current.discountValue;

            return savedCurrent > savedBest ? current : best;
        });
    };

    const findAvailableCombos = (data: PromotionsResponse, product: Product): ComboDealResponse[] => {
        const results: ComboDealResponse[] = [];

        for (const comboPromotion of data.comboPromotions) {
            for (const combo of comboPromotion.combos) {
                const isInCombo = combo.comboItems.some(item => item.product.id === product.id);
                if (isInCombo) results.push(combo);
            }
        }

        return results;
    };

    // -- Suggestion click handler ------------------------------------------------------------
    const handleSuggestionOnClick = async (product: Product) => {
        const lastDash = searchTerm.lastIndexOf("-");
        const HasExplicitSize = lastDash > 0;

        let selectedSize: string | null = null;

        if (HasExplicitSize) {
            const potentialSize = searchTerm.slice(lastDash + 1).toUpperCase();

            const sizeEntry = product.quantities.find(q => q.size === potentialSize);
            if (!sizeEntry) {
                dispatch(addAlert({ type: AlertType.ERROR, message: "Size không tồn tại" }));
                return;
            }

            const currentQtyInCart = getCurrentCartQuantity(product.id, potentialSize);

            if (sizeEntry.quantities - currentQtyInCart <= 0) {
                dispatch(addAlert({ type: AlertType.ERROR, message: "Size này đã hết hàng" }));
                return;
            }
            selectedSize = potentialSize;
        } else {
            selectedSize = getAvailableSize(product);

            if (!selectedSize) {
                dispatch(addAlert({ type: AlertType.ERROR, message: "Sản phẩm đã hết hàng" }));
                return;
            }
        }

        try {
            const promotionsData = await searchPromotionsMutation.mutateAsync(product.id);
            const bestPromotion = findBestProductPromotion(promotionsData, product);
            const availableCombos = findAvailableCombos(promotionsData, product);
            AddToCart(product, selectedSize, availableCombos, bestPromotion);
        } catch {
            AddToCart(product, selectedSize, [], undefined);
        }

        setSearchTerm("");
    };

    // -- Search input key handler ------------------------------------------------------------
    const handleSearchKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;

        const lastDash = searchTerm.lastIndexOf("-");
        if (lastDash <= 0) return;

        const potentialId = searchTerm.slice(0, lastDash).toUpperCase();
        const potentialSize = searchTerm.slice(lastDash + 1).toUpperCase();

        const matched = products.find((p: ProductWithOrderStatus) =>
            p.productId.toUpperCase() === potentialId &&
            p.quantities.some((q) => q.size.toUpperCase() === potentialSize)
        );

        if (!matched) {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không tìm thấy sản phẩm" }));
            return;
        }

        await handleSuggestionOnClick(matched);
    };

    // -- Render ------------------------------------------------------------------------------
    return (
        <main className="px-10 pt-10 pb-25">
            <div className="grid grid-cols-7 gap-x-10 gap-y-5">
                <div className="col-span-5 flex items-center">
                    <p className="text-purple text-3xl font-medium">Bán hàng</p>
                </div>

                <div className="col-span-2">
                    <SearchInput<ProductWithOrderStatus>
                        label=""
                        placeHolder="Tìm kiếm sản phẩm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        suggestions={suggestions}
                        isItemDisabled={(item) => item.data.isInPendingOrder}
                        onSuggestionClick={(item) => {
                            handleSuggestionOnClick(item.data);
                        }}
                        renderItem={(item) => (
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8">
                                        <Image src={item.data.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} fill alt="" className="object-cover" unoptimized/>
                                    </div>
                                    <span>{item.label}</span>
                                </div>
                                {item.data.isInPendingOrder && <p className="text-sm text-pink">Đang chờ duyệt</p>}
                            </div>
                        )}
                        onKeyDown={handleSearchKeyDown}
                        disabled={isOrderComplete}
                    />
                </div>

                <div className="col-span-5">
                    <SaleProductsTable
                        cart={cart}
                        isLocked={isOrderComplete}
                        onQuantityChange={UpdateQuantity}
                        onRemove={RemoveFromCart}
                        onDiscountChange={UpdateDiscount}
                        onSizeChange={UpdateSize}
                        onApplyCombo={ApplyCombo}
                        onComboSlotQuantityChange={UpdateComboSlotQuantity}
                        onComboSizeModalClose={MergeDuplicateComboLines}
                    />
                </div>

                <div className="col-span-2">
                    <InvoiceForm
                        cart={cart}
                        isLocked={isOrderComplete}
                        onOrderComplete={handleOrderComplete}
                        onReset={handleReset}                    
                    />
                </div>
            </div>
        </main>
    );
}