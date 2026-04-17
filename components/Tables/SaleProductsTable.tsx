"use client";

import { Column } from "@/types/UIType";
import { removeProduct, SaleProduct, updateDiscount, updateQuantity } from "@/utilities/SaleProductStore";
import { Table } from "./Table";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { TrashIcon } from "@/public/assets/Icons";
import Image from "next/image";
import { formatThousands } from "@/utilities/numberFormat";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { AddIcon, MinusIcon } from "@/public/assets/Icons";
import { Cell } from "../Cell";

interface SaleProductsTableProps {
    disabled?: boolean;
}

export function SaleProductsTable({ disabled = false }: SaleProductsTableProps) {
    const dispatch = useDispatch();
    const products = useSelector((state: RootState) => state.saleProduct.products);

    const getAvailableQuantity = (row: SaleProduct) => {
        return row.quantities.find((q) => q.size === row.selectedSize)?.quantities ?? 0;
    };

    const columns: Column<SaleProduct>[] = [
        { title: "Hình ảnh", key: "productId", render: (row) => (
            <div className="relative w-20 h-20 mx-auto">
                <Image src={row.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
            </div>
        )},
        { title: "Tên sản phẩm", key: "productName", render: (row) => <span>{row.productName} - {row.selectedSize}</span>},
        { title: "Đơn giá", key: "salePrice", render: (row) => {
            const discountedPrice = Math.round(row.salePrice * (1 - row.discount / 100));

            return (
                <div className="flex flex-col items-center gap-1">
                    {row.discount > 0 ? (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-red-500 line-through">{formatThousands(row.salePrice)} VNĐ</span>
                            <span>→</span>
                            <span className="text-purple font-bold">{formatThousands(discountedPrice)} VNĐ</span>
                        </div>
                    ) : (
                        <span>{formatThousands(row.salePrice)} VNĐ</span>
                    )}
                </div>
            );
        }},        
        { title: "Số lượng", key: "quantity", render: (row) => {
            const available = getAvailableQuantity(row);
            return (
                <div className="flex items-center justify-center gap-4">
                    <button className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => {
                            if (row.quantity <= 1) {
                                dispatch(addAlert({ type: AlertType.WARNING, message: "Số lượng tối thiểu là 1" }));
                                return;
                            }
                            dispatch(updateQuantity({ productId: row.productId, selectedSize: row.selectedSize, quantity: row.quantity - 1 }));
                        }}
                        disabled={disabled}
                    >
                        <MinusIcon width={24} height={24} className=""/>
                    </button>
                    <p>{row.quantity}</p>
                    <button className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                        onClick={() => {
                            if (row.quantity >= available) {
                                dispatch(addAlert({ type: AlertType.WARNING, message: `Số lượng tối đa là ${available}` }));
                                return;
                            }
                            dispatch(updateQuantity({ productId: row.productId, selectedSize: row.selectedSize, quantity: row.quantity + 1 }));
                        }}
                        disabled={disabled}
                    >
                        <AddIcon width={24} height={24} className=""/>
                    </button>
                </div>
            );
        }},
        { title: "Chiết khấu", key: "discount", render: (row) => (
            <Cell
                isPercentage={true}
                value={row.discount}
                onSave={(newDiscount) => {
                    if (newDiscount > 100) {
                        dispatch(addAlert({ type: AlertType.WARNING, message: "Chiết khấu không được vượt quá 100%" }));
                        return;
                    }
                    dispatch(updateDiscount({ productId: row.productId, selectedSize: row.selectedSize, discount: newDiscount }));
                    dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật chiết khấu thành công" }));
                }}
                disabled={disabled}
            />
        )},
        { title: "Xoá", key: "delete", render: (row) => (
            <button
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => {
                    dispatch(removeProduct({ productId: row.productId, selectedSize: row.selectedSize }));
                    dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xoá sản phẩm thành công" }));
                }}
                disabled={disabled}
            >
                <TrashIcon width={24} height={24} className={"text-red-500"}/>
            </button>
        )}
    ];

    return (
        <Table
            columns={columns}
            data={products}
        />
    )
}