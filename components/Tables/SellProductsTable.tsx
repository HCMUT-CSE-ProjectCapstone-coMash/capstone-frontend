"use client";

import { Column } from "@/types/UIType";
import { SellProduct } from "@/utilities/SellProductStore";
import { Table } from "./Table";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { TrashIcon } from "@/public/assets/Icons";
import Image from "next/image";

export function SellProductsTable() {
    const dispatch = useDispatch();
    const products = useSelector((state: RootState) => state.sellProduct.products);

    const columns: Column<SellProduct>[] = [
        { title: "Hình ảnh", key: "productId", render: (row) => (
            <div className="relative w-20 h-20 mx-auto">
                <Image src={row.imageURL} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
            </div>
        )},
        { title: "Tên sản phẩm", key: "productName", render: (row) => <span>{row.productName} - {row.selectedSize}</span>},
        { title: "Đơn giá", key: "salePrice", render: (row) => <span>{row.salePrice}</span>},
        { title: "Số lượng", key: "quantity", render: (row) => <span>{row.quantity}</span>},
        { title: "Chiết khấu", key: "discount", render: (row) => (
            <span>{row.discount}</span>
        )},
        { title: "Xoá", key: "delete", render: (row) => (
            <button
                className="cursor-pointer"
                onClick={() => {

                }}
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