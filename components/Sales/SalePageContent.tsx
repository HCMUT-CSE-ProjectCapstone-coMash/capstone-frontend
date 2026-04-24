"use client";

import { Product, ProductWithOrderStatus } from "@/types/product";
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
import { AppliedProductDiscount, CartLine, ComboDealResponse, ProductCartLine, PromotionsResponse } from "@/types/cart";
import { InvoiceForm } from "../Forms/InvoiceForm";

export function SalePageContent() {
    const dispatch = useDispatch();

    const [cart, setCart] = useState<CartLine[]>([]);

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
        onSuccess: (data: PromotionsResponse) => {
            return data;
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể lấy thông tin khuyến mãi của sản phẩm" }));
        }
    });

    // -- Cart Handler ------------------------------------------------------------------------
    const AddToCart = (product: Product, selectedSize: string, availableCombos: ComboDealResponse[], appliedPromotion?: AppliedProductDiscount) => {
        const existingLineIndex = cart.findIndex(
            line => line.kind === "product" && line.product.id === product.id && line.selectedSize === selectedSize
        );

        if (existingLineIndex >= 0) {
            const updatedCart = [...cart];
            const existingLine = updatedCart[existingLineIndex] as ProductCartLine;
            updatedCart[existingLineIndex] = { ...existingLine, quantity: existingLine.quantity + 1 };
            setCart(updatedCart);
        } else {
            setCart([...cart, {
                kind: "product",
                product,
                selectedSize,
                quantity: 1,
                discount: 0,
                appliedPromotion,
                availableCombos
            }]);
        }

        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã thêm sản phẩm vào giỏ hàng" }));
    };

    const UpdateQuantity = (lineIndex: number, newQuantity: number) => {
        const updatedCart = [...cart];
        const line = updatedCart[lineIndex];

        if (newQuantity <= 0) {
            setCart(updatedCart.filter((_, index) => index !== lineIndex));
        } else {
            updatedCart[lineIndex] = { ...line, quantity: newQuantity };
            setCart(updatedCart);
        }
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
        if (!sizeEntry || sizeEntry.quantities <= 0) {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Size này đã hết hàng" }));
            return;
        }
    
        const clampedQuantity = Math.min(line.quantity, sizeEntry.quantities);
    
        updatedCart[lineIndex] = { ...line, selectedSize: newSize, quantity: clampedQuantity };
        setCart(updatedCart);
        dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã đổi size thành ${newSize}` }));
    };
    
    const ApplyCombo = (lineIndex: number, combo: ComboDealResponse) => {
        const updatedCart = [...cart];
        updatedCart[lineIndex] = {
            kind: "combo",
            appliedCombo: combo,
            quantity: 1,
            itemSlots: combo.comboItems.flatMap((item) =>
                Array.from({ length: item.quantity }, () => ({
                    product: item.product,
                    selectedSize: item.product.quantities[0]?.size ?? "",
                }))
            ),
        };
        setCart(updatedCart);
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
        const potentialSize = lastDash > 0 ? searchTerm.slice(lastDash + 1).toUpperCase() : "";

        const availableSizes = product.quantities.map((q) => q.size);
        const selectedSize = availableSizes.includes(potentialSize) ? potentialSize : availableSizes[0];

        const sizeEntry = product.quantities.find((q) => q.size === selectedSize);
        if (!sizeEntry || sizeEntry.quantities <= 0) {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Sản phẩm đã hết hàng" }));
            setSearchTerm("");
            return;
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
    }

    // -- Render ------------------------------------------------------------------------------

    return (
        <main className="px-10 pt-10 pb-25">
            <div className="grid grid-cols-5 gap-x-10 gap-y-5">
                {/* Row 1: title + search */}
                <div className="col-span-3 flex items-center">
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
                    />
                </div>

                {/* Row 2: table + form */}
                <div className="col-span-3">
                    <SaleProductsTable 
                        cart={cart}
                        onQuantityChange={UpdateQuantity}
                        onRemove={RemoveFromCart}
                        onDiscountChange={UpdateDiscount}
                        onSizeChange={UpdateSize}
                        onApplyCombo={ApplyCombo}
                    />
                </div>

                <div className="col-span-2">
                    <InvoiceForm
                        cart={cart}
                    />
                </div>
            </div>
        </main>
    );
}