"use client";

import { useState, useEffect } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { RadioInput } from "../FormInputs/RadioInput";
import { SearchInput } from "../FormInputs/SearchInput";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { RootState } from "@/utilities/store";
import { PaymentMethod } from "@/const/PaymentMethod";

interface InvoiceFormState {
    customerName: string;
    customerPhone: string;
    customerMoney: number;
    paymentMethod: PaymentMethod; 
}

const initialInvoiceFormState: InvoiceFormState = {
    customerName: "",
    customerPhone: "",
    customerMoney: 0,
    paymentMethod: PaymentMethod.CASH,
};

const paymentOptions: { value: string, label: string }[] = [
    { value: PaymentMethod.CASH, label: "Tiền mặt" },
    { value: PaymentMethod.TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.DEBIT, label: "Ghi nợ" }
];

export function InvoiceForm() {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user); // Lấy thông tin user từ Redux store
    const products = useSelector((state: RootState) => state.sellProduct.products);

    const [form, setForm] = useState<InvoiceFormState>(initialInvoiceFormState);
    const setField = <K extends keyof InvoiceFormState>(key: K, value: InvoiceFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const [searchTerm, setSearchTerm] = useState("");

    const [currentTime, setCurrentTime] = useState<string>("");

    const totalAmount = products.reduce((sum, product) => {
        const discountedPrice = Math.round(product.salePrice * (1 - product.discount / 100));
        return sum + discountedPrice * product.quantity;
    }, 0);

    // Xử lý thay đổi phương thức thanh toán
    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedMethod = e.target.value as PaymentMethod;
        setField("paymentMethod", selectedMethod);

        if (selectedMethod === PaymentMethod.CASH) {
            setField("customerMoney", 0)
        } else if (selectedMethod === PaymentMethod.TRANSFER) {
            setField("customerMoney", totalAmount);
        } else if (selectedMethod === PaymentMethod.DEBIT) {
            setField("customerMoney", 0);
        }
    };

    // --- TÍNH TOÁN TIỀN THỐI / TIỀN NỢ ---
    const isDebit = form.paymentMethod === PaymentMethod.DEBIT;

    // Tiền thối (chỉ tính khi khách đưa dư)
    const returnMoney = form.customerMoney > totalAmount ? form.customerMoney - totalAmount : 0;

    // Tiền nợ (chỉ tính khi khách đưa thiếu)
    const debtAmount = totalAmount > form.customerMoney ? totalAmount - form.customerMoney : 0;

    // Xác định Text và Số tiền hiển thị dựa trên phương thức thanh toán
    const displayLabel = isDebit ? "Số tiền còn nợ" : "Số tiền hoàn trả";
    const displayAmount = isDebit ? debtAmount : returnMoney;

    useEffect(() => {
    const updateTime = () => {
        const now = new Date();
        
        // Lấy ngày, tháng, năm
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Tháng trong JS bắt đầu từ 0
        const year = now.getFullYear();
        
        // Lấy giờ, phút
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        // Nối chuỗi theo định dạng mong muốn
        setCurrentTime(`${day}/${month}/${year} - ${hours}:${minutes}`);
    };

    updateTime(); // Gọi ngay lần đầu tiên component mount

    // (Tùy chọn) Cập nhật lại thời gian mỗi 60 giây để đồng hồ chạy real-time
    const intervalId = setInterval(updateTime, 60000); 

    // Cleanup function để tránh rò rỉ bộ nhớ
    return () => clearInterval(intervalId);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xuất hóa đơn thành công!" }));
    };

    return (
        <form 
            className="flex flex-col w-full bg-gwhite p-5 rounded-lg font-normal gap-y-5"
        >
            <div className="flex flex-row justify-between">
                <div className="text-sm text-tgray9">Thời gian bán hàng</div>
                <div className="text-sm">{currentTime || "--/--/---- - --:--"}</div>
            </div>
            
            <div className="flex flex-row justify-between">
                <div className="text-sm text-tgray9">Người bán hàng</div>
                <div className="text-sm">{user.fullName}</div>
            </div>

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

            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">Tổng tiền</div>
                <div className="text-sm font-semibold">{formatThousands(totalAmount)} VND</div>
            </div>
            
            <RadioInput
                label="Phương thức thanh toán"
                labelPosition="right"
                options={paymentOptions}
                value={form.paymentMethod}
                onChange={handlePaymentMethodChange} 
            />

            <TextInput
                label= "Số tiền khách đưa"
                placeHolder="0" 
                labelPosition="right"
                value={formatThousands(form.customerMoney)} 
                onChange={(e) => setField("customerMoney", parseFormattedNumber(e.target.value))} 
            />
            
            {/* --- CẬP NHẬT HIỂN THỊ LABEL VÀ AMOUNT --- */}
            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">{displayLabel}</div>
                <div className="text-sm font-semibold">{formatThousands(displayAmount)} VND</div>
            </div>
            
            <button 
                type="submit" 
                onClick={handleSubmit}
                className="p-2.5 w-45 self-center rounded-lg text-white font-semibold bg-purple text-base cursor-pointer hover:bg-opacity-90 transition-all"
            >
                Xuất hóa đơn  
            </button>
        </form>
    );
}