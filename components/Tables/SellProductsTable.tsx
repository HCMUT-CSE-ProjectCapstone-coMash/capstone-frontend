"use client";

import { useState } from "react";
import { TrashIcon } from "@/public/assets/Icons";


interface ProductRowProps {
    name: string;
    price: string;
    discount: string;
}
function ProductRow({ name, price, discount }: ProductRowProps  ) {
    // Mỗi khi gọi <ProductRow />, nó sẽ tự tạo một state quantity riêng biệt
    const [quantity, setQuantity] = useState(1);

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };

    return (
        <tr className="border-b border-tgray5">
            <td className="py-5 text-center">{name}</td>
            <td className="py-5 text-center">{price}</td>
            <td className="py-5">
                <div className="flex items-center justify-center gap-4">
                    <button 
                        onClick={decreaseQuantity}
                        className="font-bold text-xl hover:text-gray-500 w-6 h-6 flex items-center justify-center cursor-pointer select-none"
                    >
                        −
                    </button>
                    <span className="w-4 text-center">{quantity}</span>
                    <button 
                        onClick={increaseQuantity}
                        className="font-bold text-xl hover:text-gray-500 w-6 h-6 flex items-center justify-center cursor-pointer select-none"
                    >
                        +
                    </button>
                </div>
            </td>
            <td className="py-5 text-center">{discount}</td>
            <td className="py-5 text-center flex justify-center">
                <TrashIcon width={24} height={24} className="text-red-500 cursor-pointer hover:text-red-700" />
            </td>
        </tr>
    );
}

// 2. Component chính SellProductsTable
export function SellProductsTable() {
    return (
        <table className="w-full text-sm text-black">
            <thead>
                <tr className="border-b border-tgray5">
                    <th className="pb-5 font-semibold text-center">Tên sản phẩm</th>
                    <th className="pb-5 font-semibold text-center">Đơn giá</th>
                    <th className="pb-5 font-semibold text-center">Số lượng</th>
                    <th className="pb-5 font-semibold text-center">Khuyến mãi</th>
                    <th className="pb-5"></th>
                </tr>
            </thead>
            <tbody>
                <ProductRow 
                    name="Đầm đen cách điệu" 
                    price="200.000VND" 
                    discount="10%" 
                />

                <ProductRow 
                    name="Quần jean ngắn sọc" 
                    price="120.000VND" 
                    discount="" 
                />
            </tbody>
        </table>
    );
}