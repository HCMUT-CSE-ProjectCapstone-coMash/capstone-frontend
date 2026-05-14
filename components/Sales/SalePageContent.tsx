"use client";

import { SaleProductsTable } from "../Tables/SaleProductsTable/SaleProductsTable";
import { useState } from "react";
import { AppliedProductDiscount, CartLine, ComboDealResponse } from "@/types/cart";
import { InvoiceForm } from "../Forms/InvoiceForm";
import { SearchInput } from "../FormInputs/SearchInput";

export function SalePageContent() {
    const [cart, setCart] = useState<CartLine[]>([]);
    const [knownCombos, setKnownCombos] = useState<Map<string, ComboDealResponse>>(new Map());
    const [promotionRegistry, setPromotionRegistry] = useState<Map<string, AppliedProductDiscount>>(new Map());

    const [isOrderComplete, setIsOrderComplete] = useState(false);

    const handleReset = () => {
        setCart([]);
        setKnownCombos(new Map());
        setPromotionRegistry(new Map());
        setIsOrderComplete(false);
    };

    // -- Render ------------------------------------------------------------------------------
    return (
        <main className="px-10 pt-10 pb-25">
            <div className="grid grid-cols-7 gap-x-10 gap-y-5">
                <div className="col-span-5 flex items-center">
                    <p className="text-purple text-3xl font-medium">Bán hàng</p>
                </div>

                <div className="col-span-2">
                    <SearchInput
                        label=""
                        placeHolder="Tìm kiếm đơn hàng"
                        value={""}
                        onChange={() => {}}
                        suggestions={[]}
                        onSuggestionClick={() => {}}
                        renderItem={() => <></>}
                    />
                </div>

                <div className="col-span-5">
                    <SaleProductsTable
                        cart={cart}
                        setCart={setCart}
                        isLocked={isOrderComplete}
                        knownCombos={knownCombos}
                        setKnownCombos={setKnownCombos}
                        promotionRegistry={promotionRegistry}
                        setPromotionRegistry={setPromotionRegistry}
                    />
                </div>

                <div className="col-span-2">
                    <InvoiceForm
                        cart={cart}
                        isLocked={isOrderComplete}
                        onOrderComplete={() => setIsOrderComplete(true)}
                        onReset={handleReset}                    
                    />
                </div>
            </div>
        </main>
    );
}