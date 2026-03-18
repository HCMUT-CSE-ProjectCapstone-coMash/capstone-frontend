"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { MoneyInput } from "../FormInputs/MoneyInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

interface InvoiceFormState {
    customerName: string;
    customerPhone: string;
    customerMoney: string;
}

const initialInvoiceFormState: InvoiceFormState = {
    customerName: "",
    customerPhone: "",
    customerMoney: "",
};

export function InvoiceForm() {
    const [form, setForm] = useState<InvoiceFormState>(initialInvoiceFormState);
    const dispatch = useDispatch();

    const setField = <K extends keyof InvoiceFormState>(key: K, value: InvoiceFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // Giả lập tổng tiền
    const totalAmount = 120000;
    const customerMoneyNum = Number(form.customerMoney);
    const returnMoney = customerMoneyNum > totalAmount ? customerMoneyNum - totalAmount : 0;

    // Xử lý khi bấm nút Xuất hóa đơn
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate tên khách hàng
        if (!form.customerName.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên khách hàng" }));
            return;
        }

        // 2. Validate số điện thoại
        if (!form.customerPhone.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số điện thoại khách hàng" }));
            return;
        }

        // 3. Validate số tiền khách đưa (chưa nhập)
        if (form.customerMoney === "") {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số tiền khách đưa" }));
            return;
        }

        // Nếu qua hết các bước kiểm tra, thực hiện gọi API hoặc xử lý xuất hóa đơn ở đây
        console.log("Dữ liệu hóa đơn chuẩn bị gửi:", form);
        
        // Hiển thị thông báo thành công
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xuất hóa đơn thành công!" }));
    };

    return (
        <form 
            onSubmit={handleSubmit} 
            className="bg-gwhite flex flex-col justify-between p-5 w-152.25 min-h-161.5 rounded-lg font-normal"
        >
            <div className="flex flex-row justify-between">
                <div className="text-sm text-tgray9">Thời gian bán hàng</div>
                <div className="text-sm">9/11/2025 - 11:44</div>
            </div>
            
            <div className="flex flex-row justify-between">
                <div className="text-sm text-tgray9">Người bán hàng</div>
                <div className="text-sm">Đoàn Lê Vy</div>
            </div>

            <div className="flex flex-col gap-y-4">
                <TextInput 
                    label={"Tên khách hàng"} 
                    placeHolder="Nhập tên" 
                    value={form.customerName}
                    onChange={(e) => setField("customerName", e.target.value)}
                />

                <TextInput 
                    label={"Số điện thoại khách hàng"} 
                    placeHolder="Nhập số điện thoại" 
                    value={form.customerPhone}
                    onChange={(e) => setField("customerPhone", e.target.value)}
                />
            </div>

            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">Tổng tiền</div>
                <div className="text-sm font-semibold">{totalAmount.toLocaleString("vi-VN")} VND</div>
            </div>
            
            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">Phương thức thanh toán</div>
                <div className="text-sm">Tiền mặt</div>
            </div>
            
            <div>
                <MoneyInput
                    label="Số tiền khách đưa"
                    placeHolder="0" 
                    labelPosition="right"
                    value={form.customerMoney}
                    inputType="string"
                    onChange={(e) => setField("customerMoney", e.target.value)}
                />
            </div>
            
            <div className="flex flex-row justify-between items-center mt-2 mb-4">
                <div className="text-sm text-tgray9">Số tiền hoàn trả</div>
                <div className="text-sm font-medium">{returnMoney.toLocaleString("vi-VN")} VND</div>
            </div>
            
            <button 
                type="submit" 
                className="p-2.5 w-45 self-center rounded-lg text-white font-semibold bg-purple text-base cursor-pointer"
            >
                Xuất hóa đơn  
            </button>
        </form>
    );
}