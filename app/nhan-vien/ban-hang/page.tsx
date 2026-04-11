"use client";
import { FetchApprovedProductByName } from "@/api/products/products";
import { SearchInput } from "@/components/FormInputs/SearchInput";
import { useDebounce } from "@/hooks/useDebounce";
import { ProductWithOrderStatus } from "@/types/product";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { InvoiceForm } from "@/components/Forms/InvoiceForm";
import { SaleProductsTable } from "@/components/Tables/SaleProductsTable";
import { useDispatch } from "react-redux";
import { addProduct } from "@/utilities/SaleProductStore";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

export default function SalePage() {
    const dispatch = useDispatch();
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

    const handleAddProduct = useCallback((product: ProductWithOrderStatus, selectedSize: string) => {
        dispatch(addProduct({
            ...product,
            selectedSize,
            quantity: 1,
            discount: 0,
        }));

        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm sản phẩm thành công" }))
    }, [dispatch]);
    
    // Lựa chọn sản phẩm để thêm vô danh sách bán hàng
    const handleSuggestionOnClick = (product: ProductWithOrderStatus) => {
        const lastDash = searchTerm.lastIndexOf("-");
        const potentialSize = lastDash > 0 ? searchTerm.slice(lastDash + 1).toUpperCase() : "";
    
        const availableSizes = product.quantities.map((q) => q.size);
        const selectedSize = availableSizes.includes(potentialSize) ? potentialSize : availableSizes[0];
    
        handleAddProduct(product, selectedSize);
        setSearchTerm("");
    };
    
    // Tự động lựa sản phẩm thêm vào danh sách bán hàng
    useEffect(() => {
        if (!debouncedName || products.length === 0) return;
    
        const lastDash = debouncedName.lastIndexOf("-");
        if (lastDash <= 0) return;
    
        const potentialId = debouncedName.slice(0, lastDash).toUpperCase();
        const potentialSize = debouncedName.slice(lastDash + 1).toUpperCase();
    
        const matched = products.find((p: ProductWithOrderStatus) =>
            p.productId.toUpperCase() === potentialId &&
            p.quantities.some((q) => q.size.toUpperCase() === potentialSize)
        );
    
        if (!matched) return;
    
        handleAddProduct(matched, potentialSize);
        setTimeout(() => setSearchTerm(""), 0);
    }, [debouncedName, products, handleAddProduct]);

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
                        onSuggestionClick={(item) => handleSuggestionOnClick(item.data)}
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
                    <SaleProductsTable/>
                </div>

                <div className="col-span-2">
                    <InvoiceForm/>
                </div>
            </div>
        </main>
    );
}