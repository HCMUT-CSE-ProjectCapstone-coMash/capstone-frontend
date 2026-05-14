"use client";

import { AnalyzeImage } from "@/api/products/products";
import { GetProductsOrderById } from "@/api/productsOrder/productsOrder";
import { ProductWithOrderStatus } from "@/types/product";
import { sortSizes } from "@/utilities/cart";
import { formatThousands } from "@/utilities/numberFormat";
import { setOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { setEditingProduct } from "@/utilities/productEditStore";
import { RootState } from "@/utilities/store";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

interface SuggestionModalProps {
    products: ProductWithOrderStatus[];
    productsOrdersId: string;
    onClose: () => void;
    onAnalyzeResult: (data: { productName: string; category: string; color: string; pattern: string }) => void;
    imageFile: File;
}

export function SuggestionModal({ products, productsOrdersId, onClose, onAnalyzeResult, imageFile }: SuggestionModalProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const { data } = useQuery({
        queryKey: ["productsOrderDetails", productsOrdersId],
        queryFn: () => GetProductsOrderById(productsOrdersId as string),
        enabled: !!productsOrdersId,
        refetchOnWindowFocus: false
    });

    // Xử lý khi người dùng chọn hình ảnh để phân tích và tự động điền thông tin sản phẩm
    const analyzeImageMutation = useMutation({
        mutationFn: (imageFile: File) => AnalyzeImage(imageFile),

        onSuccess: (data) => {
            onAnalyzeResult({
                productName: data.productName,
                category: data.category,
                color: data.color,
                pattern: data.pattern
            });
            onClose();
        },

        onError: () => {

        }
    });

    const orderProducts = data?.products ?? [];

    return (
        <div className="w-xl flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xl font-medium text-purple">Sản phẩm tương tự</p>

            <div className="flex flex-col gap-2.5">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                        <p className="text-gray-500">Không tìm thấy sản phẩm tương tự</p>
                        <p className="text-sm text-gray-400">Hãy tạo sản phẩm mới bên dưới</p>
                    </div>
                ) : (
                    products.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
                        >
                            <div className="relative w-24 h-24 shrink-0">
                                <Image
                                    src={p.imageURL}
                                    placeholder="blur"
                                    blurDataURL="/assets/image/light-pink.png"
                                    alt=""
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
    
                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <p className="font-medium truncate">{p.productName}</p>
                                <p className="text-gray-500">
                                    Giá bán: {formatThousands(p.salePrice)} VNĐ
                                </p>
                                <div className="flex flex-wrap gap-1.5 mt-0.5">
                                    {sortSizes(p.quantities.map(q => q.size), p.sizeType).map((size) => {
                                        const q = p.quantities.find(q => q.size === size);
                                        return (
                                            <div key={size} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5">
                                                <span className="text-sm text-gray-500">{size}:</span>
                                                <span className="text-sm text-purple font-bold">{q?.quantities}</span>
                                            </div>
    
                                        );
                                    })}
                                </div>
                            </div>
    
                            {orderProducts.some((op: { id: string }) => op.id === p.id) ? (
                                <button 
                                    className="shrink-0 px-3.5 py-1.5 rounded-lg border border-pink text-pink text-sm hover:bg-pink/5 transition cursor-pointer"
                                    onClick={() => {
                                        if (user.role === "owner") {
                                            dispatch(setOwnerEditingProduct(p));
                                        } else {
                                            dispatch(setEditingProduct(p));
                                        }
                                        onClose();
                                    }}
                                >
                                    Điều chỉnh
                                </button>
                            ) : p.isInPendingOrder ? (
                                <p className="text-xs text-pink shrink-0">Đang chờ duyệt</p>
                            ) : (
                                <button 
                                    className="shrink-0 px-3.5 py-1.5 rounded-lg border border-purple text-purple text-sm hover:bg-purple/5 transition cursor-pointer"
                                    onClick={() => {
                                        if (user.role === "owner") {
                                            dispatch(setOwnerEditingProduct(p));
                                        } else {
                                            dispatch(setEditingProduct(p));
                                        }
                                        onClose();
                                    }}
                                >
                                    Chọn
                                </button>
                            )}
                        </div>
                    ))
                )}

            </div>

            <div className="flex items-center justify-center gap-3 mt-2">
                <button
                    className="py-2 px-3 rounded-lg text-white bg-pink text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={analyzeImageMutation.isPending}
                    onClick={() => analyzeImageMutation.mutate(imageFile)}
                >
                    {analyzeImageMutation.isPending ? "Đang tạo..." : "Tạo sản phẩm mới"}
                </button>
            </div>
        </div>
    );
}