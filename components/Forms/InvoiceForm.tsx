"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { MoneyInput } from "../FormInputs/MoneyInput";
import { RadioInput } from "../FormInputs/RadioInput";
import { SearchInput } from "../FormInputs/SearchInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

interface InvoiceFormState {
    customerName: string;
    customerPhone: string;
    customerMoney: string;
    paymentMethod: string; 
}

const initialInvoiceFormState: InvoiceFormState = {
    customerName: "",
    customerPhone: "",
    customerMoney: "",
    paymentMethod: "cash",
};

interface InvoiceMock {
    id: string;
    invoiceId: string;
    saleTime: string;
    totalAmount: number;
    // Vẫn giữ phone/name để phục vụ logic search nếu cần
    phone: string;
}

const MOCK_INVOICES: InvoiceMock[] = [
    { 
        id: "1", 
        invoiceId: "HD001", 
        saleTime: "09/11/2025 11:44", 
        totalAmount: 120000, 
        phone: "0934048691" 
    },
    { 
        id: "2", 
        invoiceId: "HD002", 
        saleTime: "10/11/2025 08:30", 
        totalAmount: 550000, 
        phone: "0912345678" 
    },
];

const paymentOptions = [
    { id: 'cash', label: 'Tiền mặt' },
    { id: 'transfer', label: 'Chuyển khoản' },
    { id: 'debit', label: 'Ghi nợ' },
];

export function InvoiceForm() {
    const [form, setForm] = useState<InvoiceFormState>(initialInvoiceFormState);
    const [searchQuery, setSearchQuery] = useState("");
    const dispatch = useDispatch();

    const setField = <K extends keyof InvoiceFormState>(key: K, value: InvoiceFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    // Lọc suggestion dựa trên Số điện thoại (phone)
    const suggestions = MOCK_INVOICES
        .filter(inv => inv.phone.includes(searchQuery))
        .map(inv => ({
            label: inv.phone,
            value: inv.phone,
            data: inv
        }));

    const handleSuggestionClick = (item: { data: InvoiceMock }) => {
        console.log("Đã chọn hóa đơn:", item.data);
        setSearchQuery(item.data.phone);
        // Có thể thêm logic load dữ liệu hóa đơn cũ vào form tại đây
    };

    const totalAmount = 120000;

    const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, "");
        const formattedValue = rawValue ? Number(rawValue).toLocaleString("vi-VN") : "";
        setField("customerMoney", formattedValue);
    };

    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedMethod = e.target.value;
        setField("paymentMethod", selectedMethod);

        if (selectedMethod === "transfer") {
            setField("customerMoney", totalAmount.toLocaleString("vi-VN"));
        } else if (selectedMethod === "debit") {
             // Tùy chọn: tự động xóa số tiền khách đưa khi chọn Ghi nợ để thu ngân tự nhập số tiền khách trả trước
             setField("customerMoney", "");
        }
    };

    // --- TÍNH TOÁN TIỀN THỐI / TIỀN NỢ ---
    const rawCustomerMoney = form.customerMoney.replace(/\./g, ""); 
    const customerMoneyNum = Number(rawCustomerMoney);
    
    const isDebit = form.paymentMethod === "debit";
    
    // Tiền thối (chỉ tính khi khách đưa dư)
    const returnMoney = customerMoneyNum > totalAmount ? customerMoneyNum - totalAmount : 0;
    
    // Tiền nợ (chỉ tính khi khách đưa thiếu)
    const debtAmount = totalAmount > customerMoneyNum ? totalAmount - customerMoneyNum : 0;

    // Xác định Text và Số tiền hiển thị dựa trên phương thức thanh toán
    const displayLabel = isDebit ? "Số tiền còn nợ" : "Số tiền hoàn trả";
    const displayAmount = isDebit ? debtAmount : returnMoney;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.customerName.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên khách hàng" }));
            return;
        }

        if (!form.customerPhone.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số điện thoại khách hàng" }));
            return;
        }

        if (form.customerMoney === "") {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số tiền khách đưa" }));
            return;
        }

        const dataToSubmit = {
            ...form,
            customerMoney: customerMoneyNum,
            debtAmount: isDebit ? debtAmount : 0 // Gửi kèm số tiền nợ lên server để lưu công nợ
        };
        console.log("Dữ liệu hóa đơn chuẩn bị gửi:", dataToSubmit);
        
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xuất hóa đơn thành công!" }));
    };

    return (
        <div className="relative">
            <div className="absolute bottom-full mb-7 right-0 w-full max-w-md">
                <SearchInput<InvoiceMock>
                    label=""
                    placeHolder="Nhập số điện thoại khách hàng"
                    isIcon={true}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    suggestions={searchQuery.length > 0 ? suggestions : []} 
                    onSuggestionClick={handleSuggestionClick}
                    renderItem={(item) => (
                        <div className="flex flex-col w-full py-1 gap-y-1">
                            {/* Dòng 1: [SĐT] - [Mã hoá đơn] */}
                            <div className="flex items-center text-sm text-purple font-medium gap-x-1">
                                <span>{item.data.phone}</span>
                                <span className="text-tgray9 font-normal">- [{item.data.invoiceId}]</span>
                            </div>

                            {/* Dòng 2: [Thời gian] và [Tổng tiền] căn lề phải */}
                            <div className="flex justify-between items-end w-full mt-1">
                                <span className="text-xs text-tgray9 italic">[{item.data.saleTime}]</span>
                                <span className="text-sm font-semibold text-black">
                                    [{item.data.totalAmount.toLocaleString("vi-VN")}] VND
                                </span>
                            </div>
                        </div>
                    )}
                />
            </div>
            <form 
                className="bg-gwhite flex flex-col justify-between p-5 w-152.25 min-h-161.5 rounded-lg font-normal gap-y-4"
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
                
                <RadioInput
                    label="Phương thức thanh toán"
                    labelPosition="right"
                    options={paymentOptions}
                    value={form.paymentMethod}
                    onChange={handlePaymentMethodChange} 
                />
                
                <div>
                    <MoneyInput
                        label= "Số tiền khách đưa"
                        placeHolder="0" 
                        labelPosition="right"
                        value={form.customerMoney} 
                        inputType="text" 
                        onChange={handleMoneyChange} 
                    />
                </div>
                
                {/* --- CẬP NHẬT HIỂN THỊ LABEL VÀ AMOUNT --- */}
                <div className="flex flex-row justify-between items-center">
                    <div className="text-sm text-tgray9">{displayLabel}</div>
                    <div className="text-sm font-semibold">{displayAmount.toLocaleString("vi-VN")} VND</div>
                </div>
                
                <button 
                    type="submit" 
                    onClick={handleSubmit}
                    className="p-2.5 w-45 self-center rounded-lg text-white font-semibold bg-purple text-base cursor-pointer hover:bg-opacity-90 transition-all"
                >
                    Xuất hóa đơn  
                </button>
            </form>
        </div>
    );
}