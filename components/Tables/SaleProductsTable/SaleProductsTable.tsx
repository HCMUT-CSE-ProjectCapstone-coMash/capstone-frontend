"use client";

import { Column } from "@/types/UIType";
import { Table } from "../Table";
import { AppliedProductDiscount, CartLine, ComboCartLine, ComboDealResponse, ProductCartLine, PromotionsResponse } from "@/types/cart";
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
import { SearchInput } from "@/components/FormInputs/SearchInput";
import { Product, ProductQuantity, ProductWithOrderStatus } from "@/types/product";
import { useDebounce } from "@/hooks/useDebounce";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FetchApprovedProductByName } from "@/api/products/products";
import { GetPromotionsByProductId } from "@/api/promotions/promotions";
import Image from "next/image";
import { pinkPlaceholder } from "@/const/placeholder";

interface SaleProductsTableProps {
    cart: CartLine[];
    setCart: (newCart: CartLine[]) => void;
    isLocked: boolean;
    knownCombos: Map<string, ComboDealResponse>;
    setKnownCombos: (map: Map<string, ComboDealResponse>) => void;
    promotionRegistry: Map<string, AppliedProductDiscount>;
    setPromotionRegistry: (map: Map<string, AppliedProductDiscount>) => void;
}

export function SaleProductsTable({ cart, setCart, isLocked, knownCombos, setKnownCombos, promotionRegistry, setPromotionRegistry } : SaleProductsTableProps) {
    const dispatch = useDispatch();

    // -- Search ----------------------------------------------------------------------------------
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

    // Fires when user selects a suggestion or presses Enter
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

    // Allows typing "PRODUCT_ID-SIZE" and pressing Enter to add directly
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

    // -- Promotions -------------------------------------------------------------------------------
    const searchPromotionsMutation = useMutation({
        mutationKey: ["get-promotions"],
        mutationFn: (productId: string) => GetPromotionsByProductId(productId),
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể lấy thông tin khuyến mãi của sản phẩm" }));
        }
    });

    // Returns the promotion with the highest absolute discount value for a given product
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

    // Returns all combo deals that include the given product
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

    // -- Stock and Cart Utilities -----------------------------------------------------------------------

    // Returns total quantity of a specific product+size currently reserved across all cart lines
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

    // Returns the first size that still has available stock (not fully consumed by the cart)
    const getAvailableSize = (product: Product): string | null => {
        for (const sizeEntry of product.quantities) {
            const currentQtyInCart = getCurrentCartQuantity(product.id, sizeEntry.size);
            if (sizeEntry.quantities - currentQtyInCart > 0) {
                return sizeEntry.size;
            }
        }
        return null;
    };

    // For product lines: remaining stock for the selected size.
    // For combo lines: max number of complete combos that can still be fulfilled.
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

    // Initializes all sizes for a product with 0 selected quantity (used when building combo slots)
    const buildInitialSlotQuantities = (product: Product): ProductQuantity[] =>
        product.quantities.map(q => ({ ...q, quantities: 0 }));

    // Collapses all cart lines into a flat product pool, merging duplicates by product+size.
    // Combo lines are expanded into their constituent products using requiredQuantity.
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

    // Returns the price of a product after applying its registered promotion (if any)
    const getEffectivePrice = (product: Product, registry: Map<string, AppliedProductDiscount>): number => {
        const promotion = registry.get(product.id);
        if (!promotion) return product.salePrice;
        if (promotion.discountType === "Percent") {
            return product.salePrice * (1 - promotion.discountValue / 100);
        }
        return product.salePrice - promotion.discountValue;
    };

    // Returns how much cheaper a combo is vs. buying each item at its effective price individually
    const getComboSavings = (combo: ComboDealResponse, registry: Map<string, AppliedProductDiscount>): number => {
        const effectiveTotal = combo.comboItems.reduce(
            (sum, item) => sum + getEffectivePrice(item.product, registry) * item.quantity,
            0
        );
        return effectiveTotal - combo.comboPrice; 
    };

    // Brute-force subset search: finds the combination of combos that maximises total savings.
    // Preserves existing combo slot selections where possible.
    const optimizeCombos = (currentCart: CartLine[], allCombos: ComboDealResponse[], knownCombosMap: Map<string, ComboDealResponse>, registry: Map<string, AppliedProductDiscount>): CartLine[] => {
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
            const savings = chosen.reduce((sum, c) => sum + getComboSavings(c, registry), 0);
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

                trySubsets(i, [...chosen, combo], newRemaining);
            }
        };

        trySubsets(0, [], pool.map(p => ({ ...p })));

        const resultCart: CartLine[] = [];
        const remaining = pool.map(p => ({ ...p }));

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

        // Remaining products that couldn't form any combo go back as standalone lines
        for (const p of remaining) {
            if (p.quantity > 0) {
                const availableCombos = [...knownCombosMap.values()].filter(combo =>
                    combo.comboItems.some(item => item.product.id === p.product.id)
                );
                resultCart.push({
                    ...p,
                    availableCombos,
                    appliedPromotion: registry.get(p.product.id),
                });
            }
        }    
    
        return mergeComboLines(resultCart);
    };

    // Merges multiple cart lines of the same combo into one, summing quantities and slot fills
    const mergeComboLines = (cartLines: CartLine[]): CartLine[] => {
        const seen = new Map<string, number>();
        const result: CartLine[] = [];

        for (const line of cartLines) {
            if (line.kind !== "combo") {
                result.push(line);
                continue;
            }

            const existingIndex = seen.get(line.appliedCombo.id);
            if (existingIndex === undefined) {
                seen.set(line.appliedCombo.id, result.length);
                result.push({ ...line });
                continue;
            }

            const existing = result[existingIndex] as ComboCartLine;
            const mergedQuantity = existing.quantity + line.quantity;

            result[existingIndex] = {
                ...existing,
                quantity: mergedQuantity,
                itemSlots: existing.itemSlots.map((slot, slotIdx) => {
                    const perComboReq = existing.appliedCombo.comboItems[slotIdx].quantity;
                    return {
                        ...slot,
                        requiredQuantity: perComboReq * mergedQuantity,
                        selectedQuantity: slot.selectedQuantity.map(q => {
                            const fromIncoming = line.itemSlots[slotIdx].selectedQuantity.find(oq => oq.size === q.size);
                            return { ...q, quantities: q.quantities + (fromIncoming?.quantities ?? 0) };
                        }),
                    };
                }),
            };
        }

        return result;
    };

    // -- Cart Operations -----------------------------------------------------------------------
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

        const updatedKnownCombos = new Map(knownCombos);
        for (const combo of availableCombos) updatedKnownCombos.set(combo.id, combo);
        setKnownCombos(updatedKnownCombos);

        const updatedPromotionRegistry = new Map(promotionRegistry);
        if (appliedPromotion) {
            updatedPromotionRegistry.set(product.id, appliedPromotion);
            setPromotionRegistry(updatedPromotionRegistry);
        }

        // Re-optimize combos on every cart change using all ever-seen combos
        const allCombos = [...updatedKnownCombos.values()];
        const finalCart = allCombos.length > 0 ? optimizeCombos(newCart, allCombos, updatedKnownCombos, updatedPromotionRegistry) : newCart;

        // Notify if a new combo was automatically applied
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
        } else if (line.kind === "combo") {
            // Scale requiredQuantity for each slot and trim any over-selected sizes
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
            skipOptimize = true; // Don't re-optimize when the user manually adjusts a combo
        } else {
            updatedCart[lineIndex] = { ...line, quantity: newQuantity };
            newCart = updatedCart;
        }
    
        const allCombos = [...knownCombos.values()];
        const finalCart = (!skipOptimize && allCombos.length > 0) ? optimizeCombos(newCart, allCombos, knownCombos, promotionRegistry) : newCart;

        setCart(finalCart);
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

        // If the new size already has a line in the cart, merge into it instead of creating a duplicate
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

    const UpdateDiscount = (lineIndex: number, discount: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (line.kind === "product") {
            updatedCart[lineIndex] = { ...line, discount };
            setCart(updatedCart);
        }
    };

    const RemoveFromCart = (lineIndex: number) => {
        setCart(cart.filter((_, index) => index !== lineIndex));
    };

    // Updates a single size's quantity within a specific slot of a combo line,
    // clamping against stock, other cart usage, and the slot's requiredQuantity cap.
    const UpdateComboSlotQuantity = (lineIndex: number, slotIndex: number, size: string, newQuantity: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (line.kind !== "combo") return;

        const slot = line.itemSlots[slotIndex];
        const sizeEntry = slot.product.quantities.find(q => q.size === size);
        if (!sizeEntry) return;

        const otherUsage = cart.reduce((total, l, i) => {
            if (i === lineIndex) {
                // Same combo line — exclude only this slot+size to avoid double-counting
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
    };

    // Manually applies a combo to a specific cart line, fetching promotions for any
    // new products that aren't yet in the registry
    const ApplyCombo = async (lineIndex: number, combo: ComboDealResponse) => {
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

        const updatedPromotionRegistry = new Map(promotionRegistry);
        const updatedKnownCombos = new Map(knownCombos);
        updatedKnownCombos.set(combo.id, combo);
    
        for (const item of combo.comboItems) {
            if (updatedPromotionRegistry.has(item.product.id)) continue;
            try {
                const promotionsData = await searchPromotionsMutation.mutateAsync(item.product.id);
                const bestPromotion = findBestProductPromotion(promotionsData, item.product);
                const availableCombos = findAvailableCombos(promotionsData, item.product);
    
                if (bestPromotion) updatedPromotionRegistry.set(item.product.id, bestPromotion);
                for (const c of availableCombos) updatedKnownCombos.set(c.id, c);
            } catch {
                // Silently skip — product will just have no promotion if it exits the combo later
            }
        }
    
        setPromotionRegistry(updatedPromotionRegistry);
        setKnownCombos(updatedKnownCombos);
        setCart(updatedCart);
    };

    // Called when the ComboSizeModal closes — collapses any duplicate combo lines that
    // may have been created during slot editing
    const MergeDuplicateComboLines = (lineIndex: number) => {
        const line = cart[lineIndex];
        if (!line || line.kind !== "combo") return;
    
        const merged = mergeComboLines(cart);
        if (merged.length === cart.length) return;
    
        setCart(merged);
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã gộp combo cùng loại" }));
    };

    // -- MODAL STATE -------------------------------------------------------------------------
    const [selectedPromotionLine, setSelectedPromotionLine] = useState<CartLine | null>(null);
    const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);

    const [selectedComboLineIndex, setSelectedComboLineIndex] = useState<number | null>(null);
    const [isComboSizeModalOpen, setIsComboSizeModalOpen] = useState(false);

    // -- TABLE COLUMNS ------------------------------------------------------------------------
    const columns: Column<CartLine>[] = [
        { title: "Tên sản phẩm", key: "productName", render: (line) => (
            <ProductNameCell line={line}/>
        )},
        { title: "Kích cỡ", key: "size", render: (line, index) => (
            <SizeCell
                line={line} 
                lineIndex={index} 
                onSizeChange={UpdateSize} 
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
                onQuantityChange={UpdateQuantity}
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

    // --RENDER ----------------------------------------------------------------------------------
    return (
        <div className="flex flex-col">
            <div className="w-1/2">
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
                                    <Image src={item.data.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} fill alt="" className="object-cover" unoptimized/>
                                </div>
                                <span>{item.label}</span>
                            </div>
                            {item.data.isInPendingOrder && <p className="text-sm text-pink">Đang chờ duyệt</p>}
                        </div>
                    )}
                    onKeyDown={handleSearchKeyDown}
                    disabled={isLocked}
                />
            </div>

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
                            ApplyCombo(cart.indexOf(selectedPromotionLine), combo);
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
                            MergeDuplicateComboLines(selectedComboLineIndex);
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
        </div>
    )
};