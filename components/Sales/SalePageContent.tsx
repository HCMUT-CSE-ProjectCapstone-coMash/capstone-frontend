"use client";

import { SaleProductsTable } from "../Tables/SaleProductsTable/SaleProductsTable";
import { useState } from "react";
import { AppliedProductDiscount, CartLine, ComboDealResponse } from "@/types/cart";
import { InvoiceForm } from "../Forms/InvoiceForm";
import { SearchInput } from "../FormInputs/SearchInput";
import { useQuery } from "@tanstack/react-query";
import { FetchAllSaleOrders } from "@/api/saleOrders/saleOrders";
import { useDebounce } from "@/hooks/useDebounce";
import { formatTime } from "@/utilities/timeFormat";
import { formatThousands } from "@/utilities/numberFormat";
import { SaleOrderResponse } from "@/types/saleOrder";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { EmployeeExchangePageRoute, OwnerExchangePageRoute } from "@/const/routes";

export function SalePageContent() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

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

    // -- Search sale orders ------------------------------------------------------------------------------
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 500);

    const effectiveSearch = debouncedSearch.length >= 2 ? debouncedSearch : "";
    
    const { data } = useQuery({
        queryKey: ["saleOrders", effectiveSearch],
        queryFn: () => FetchAllSaleOrders(1, 10, "", effectiveSearch),
        enabled: effectiveSearch !== ""
    });

    const saleOrders = data?.items ?? [];

    const suggestions = saleOrders.map((order: SaleOrderResponse) => ({
        label: order.saleOrderId,
        value: order.id,
        data: order
    }));

    const handleRouter = (id: string) => {
        if (user.role === "owner") {
            router.push(OwnerExchangePageRoute(id));
            router.refresh();
        } else {
            router.push(EmployeeExchangePageRoute(id));   
            router.refresh();         
        }
    } 
    
    // -- Render ------------------------------------------------------------------------------
    return (
        <main className="px-10 pt-10 pb-25">
            <div className="grid grid-cols-7 gap-x-10 gap-y-5">
                <div className="col-span-5 flex items-center">
                    <p className="text-purple text-3xl font-medium">Bán hàng</p>
                </div>

                <div className="col-span-2">
                    <SearchInput<SaleOrderResponse>
                        label=""
                        placeHolder="Tìm kiếm đơn hàng"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        suggestions={suggestions}
                        onSuggestionClick={(item) => handleRouter(item.value)}
                        renderItem={(item) => (
                            <div className="flex flex-col gap-0.5">
                                <div className="flex justify-between">
                                    <span className="font-medium group-hover:text-white">
                                        {item.data.saleOrderId}
                                    </span>
                                    <span className="text-sm text-gray-500 group-hover:text-white">
                                        {formatTime(item.data.createdAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span className="group-hover:text-white">
                                        {item.data.customerName ?? "Khách vãng lai"}
                                    </span>
                                    <span className="group-hover:text-white">
                                        {formatThousands(item.data.totalPrice)} VNĐ
                                    </span>
                                </div>
                            </div>
                        )}
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