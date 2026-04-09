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
 
// Mock dữ liệu hóa đơn cũ để làm suggestion khi search theo số điện thoại
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
    const user = useSelector((state: RootState) => state.user); // Lấy thông tin user từ Redux store
    const [form, setForm] = useState<InvoiceFormState>(initialInvoiceFormState);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentTime, setCurrentTime] = useState<string>("");
    const dispatch = useDispatch();

    const setField = <K extends keyof InvoiceFormState>(key: K, value: InvoiceFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const totalAmount = 120000;

    // Đổi từ 100000 thành "100.000" khi hiển thị 
    const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const formattedValue = formatThousands(e.target.value);
        setField("customerMoney", formattedValue);
    };

    // Xử lý thay đổi phương thức thanh toán
    const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedMethod = e.target.value;
        setField("paymentMethod", selectedMethod);

        if (selectedMethod === "transfer") {
            // Format số totalAmount thành chuỗi có dấu chấm
            setField("customerMoney", formatThousands(totalAmount));
        } else if (selectedMethod === "debit") {
            setField("customerMoney", "");
        }
    };

    // --- TÍNH TOÁN TIỀN THỐI / TIỀN NỢ ---
    // Sử dụng parseFormattedNumber để lấy giá trị số từ chuỗi định dạng
    const customerMoneyNum = parseFormattedNumber(form.customerMoney);

    const isDebit = form.paymentMethod === "debit";

    // Tiền thối (chỉ tính khi khách đưa dư)
    const returnMoney = customerMoneyNum > totalAmount ? customerMoneyNum - totalAmount : 0;

    // Tiền nợ (chỉ tính khi khách đưa thiếu)
    const debtAmount = totalAmount > customerMoneyNum ? totalAmount - customerMoneyNum : 0;

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
                <div className="text-sm font-semibold">{totalAmount.toLocaleString("vi-VN")} VND</div>
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
                value={form.customerMoney} 
                onChange={handleMoneyChange} 
            />
            
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
    );
}