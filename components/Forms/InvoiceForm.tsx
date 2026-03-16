"use client";

import {useState } from "react";
import { TextInput } from "../FormInputs/TextInput"
interface InvoiceFormState {
    customerName: string,
    customerPhone: string
}
const initialInvoiceFormState : InvoiceFormState = {
    customerName: "",
    customerPhone: ""
}
export function InvoiceForm () {
    const [invoice] = useState(initialInvoiceFormState);
    return (
        <div className="bg-gwhite flex flex-col justify-between p-5 w-152.25 min-h-161.5 rounded-lg font-normal">
            <div className="flex flex-row justify-between">
                <div className="text-sm">Thời gian bán hàng</div>
                <div className="text-sm">9/11/2025 - 11:44</div>
            </div>
            <div className="flex flex-row justify-between">
                <div className="text-sm">Người bán hàng</div>
                <div className="text-sm">Đoàn Lê Vy</div>
            </div>

            <div className="flex flex-row justify-between">
                <TextInput 
                    label={"Tên khách hàng"} 
                    placeHolder="Nhập tên" 
                    value={invoice.customerName}
                    onChange={() => {}}
                />
            </div>

            <div className="flex flex-row justify-between">
                <TextInput 
                    label={"Số điện thoại khách hàng"} 
                    placeHolder="Nhập số điện thoại" 
                    value={invoice.customerPhone}
                    onChange={() => {}}
                />
            </div>

            <div className="flex flex-row justify-between">
                <div className="text-sm">Tổng tiền</div>
                <div className="text-sm">Đoàn Lê Vy</div>
            </div>
            <div className="flex flex-row justify-between">
                <div className="text-sm">Phương thức thanh toán</div>
                <div className="text-sm">Đoàn Lê Vy</div>
            </div>
            <div className="flex flex-row justify-between">
                <div className="text-sm">Số tiền khách đưa</div>
                <div className="text-sm">Đoàn Lê Vy</div>
            </div>
            <div className="flex flex-row justify-between">
                <div className="text-sm">Số tiền hoàn trả</div>
                <div className="text-sm">Đoàn Lê Vy</div>
            </div>
            <button className={`p-2.5 w-45 self-center rounded-lg text-white font-weight-600 bg-purple text-base cursor-pointer`}>
                Xuất hóa đơn  
            </button>
        </div>
    )
}