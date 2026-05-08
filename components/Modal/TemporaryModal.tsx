import { FetchTemporaryProductByUserId } from "@/api/products/products";
import { TemporaryProduct } from "@/types/product";
import { RootState } from "@/utilities/store";
import { useQuery } from "@tanstack/react-query";
import { Spin } from "antd";
import Image from "next/image";
import { useSelector } from "react-redux";

interface TemporaryModalProps {
    onSelect: (product: TemporaryProduct) => void;
}

export function TemporaryModal({ onSelect }: TemporaryModalProps) {
    const user = useSelector((state: RootState) => state.user);

    const { data: temporaryProducts = [], isLoading } = useQuery({
        queryKey: ["temporaryProducts", user.id],
        queryFn: () => FetchTemporaryProductByUserId(user.id!),
        enabled: !!user.id,
    });

    return (
        <div className="w-4xl flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <p className="text-xl font-medium text-purple">Hình ảnh chụp từ điện thoại</p>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Spin size="large" />
                </div>
            ) : temporaryProducts.length === 0 ? (
                <p className="text-center text-gray-400 py-10">Không có sản phẩm tạm thời nào</p>
            ) : (
                <div className="grid grid-cols-3 gap-4 pr-1">
                    {temporaryProducts.map((product: TemporaryProduct) => (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => onSelect(product)}
                            className="flex flex-col gap-2 p-3 rounded-lg border border-gray-200 hover:border-pink hover:shadow-md transition-all cursor-pointer text-left group"
                        >
                            <div className="relative w-full aspect-square rounded overflow-hidden bg-gray-100">
                                <Image src={product.imageUrl} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium text-gray-dark line-clamp-1">{product.productName}</p>
                                <p className="text-xs text-gray-400">{product.category} · {product.color}</p>
                                {product.pattern && (
                                    <p className="text-xs text-gray-400">{product.pattern}</p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}