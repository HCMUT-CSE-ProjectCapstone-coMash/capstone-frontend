"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";

export function ProductsOrderForm() {
    const [orderName, setOrderName] = useState<string>("");
    const [orderDescription, setOrderDescription] = useState<string>("");

    return (
        <div className="w-xl">
            <p className="text-xl text-center font-medium">Tạo danh sách sản phẩm cần duyệt mới</p>

            <form action="" className="flex flex-col gap-5 mt-5">
                <TextInput
                    label={"Tên danh sách"}
                    value={orderName}
                    onChange={(e) => setOrderName(e.target.value)}
                    placeHolder={""}
                />

                <TextInput
                    label={"Mô tả (Nếu có)"}
                    value={orderDescription}
                    onChange={(e) => setOrderDescription(e.target.value)}
                    placeHolder={""}
                    inputType="textarea"
                />

                <div className="flex justify-end">
                    <button className="py-2 px-3 rounded-lg text-white bg-pink text-sm cursor-pointer">
                        Gửi yêu cầu
                    </button>
                </div>
            </form>
        </div>
    )
}