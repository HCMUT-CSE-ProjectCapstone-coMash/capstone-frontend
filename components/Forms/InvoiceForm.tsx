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
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreateCustomer, FetchCustomerByName, FetchCustomerByPhone } from "@/api/customers/customers";
import { Customer } from "@/types/customer";
import { SaleOrderRequest, SaleOrderResponse } from "@/types/saleOrder";
import { CreateSaleOrder } from "@/api/saleOrders.ts/saleOrders";
import { useDebounce } from "@/hooks/useDebounce";
import { PrintBill } from "../PrintBill";
import { CartLine } from "@/types/cart";

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

interface InvoiceFormProps {
    cart: CartLine[];
}

export function InvoiceForm({ cart }: InvoiceFormProps) {
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);

    const [form, setForm] = useState<InvoiceFormState>(initialInvoiceFormState);
    const setField = <K extends keyof InvoiceFormState>(key: K, value: InvoiceFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null); 

    // -- Current time state ------------------------------------------------------------------
    const [currentTime, setCurrentTime] = useState<string>("");

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

    // -- Search customer by name ----------------------------------------------------------------
    const debouncedSearchName = useDebounce(form.customerName, 500);

    const { data: customersByName = [] } = useQuery({
        queryKey: ["customersByName", debouncedSearchName],
        queryFn: () => FetchCustomerByName(debouncedSearchName),
        enabled: debouncedSearchName.length >= 2,
        staleTime: 0,
        gcTime: 0
    });

    const nameSuggestions = customersByName.map((c: Customer) => ({
        label: c.customerName,
        value: c.id,
        data: c
    }));

    // -- Search customer by phone ----------------------------------------------------------------
    const debouncedSearchPhone = useDebounce(form.customerPhone, 500);

    const { data: customersByPhone = [] } = useQuery({
        queryKey: ["customersByPhone", debouncedSearchPhone],
        queryFn: () => FetchCustomerByPhone(debouncedSearchPhone),
        enabled: debouncedSearchPhone.length >= 3,
        staleTime: 0,
        gcTime: 0
    });

    const phoneSuggestions = customersByPhone.map((c: Customer) => ({
        label: c.customerPhone,
        value: c.id,
        data: c,
    }));

    // -- Create new customer -----------------------------------------------------------------
    type CreateCustomerPayload = {
        customerName: string;
        customerPhone: string;
        userId: string;
    }

    const createCustomerMutation = useMutation({
        mutationFn: ({ customerName, customerPhone, userId } : CreateCustomerPayload) => CreateCustomer(customerName, customerPhone, userId),
        onSuccess: (data: Customer) => {
            setSelectedCustomer(data);
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã tạo khách hàng mới" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể tạo khách hàng mới" }));
        }
    });

    const handleCreateCustomer = () => {
        if (!user.id) return;

        if (!form.customerName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên khách hàng" }));
            return;
        }
        
        if (!form.customerPhone) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số điện thoại khách hàng" }));
            return;
        }        

        createCustomerMutation.mutate({
            customerName: form.customerName,
            customerPhone: form.customerPhone,
            userId: user.id
        });
    }

    // -- Calculate total amount --------------------------------------------------------------
    const calculateLineTotal = (line: CartLine): number => {
        if (line.kind === "combo") {
            return line.appliedCombo.comboPrice * line.quantity;
        }
    
        const basePrice = line.product.salePrice;
    
        const promotionPrice = line.appliedPromotion
            ? line.appliedPromotion.discountType === "Percent"
                ? basePrice * (1 - line.appliedPromotion.discountValue / 100)
                : basePrice - line.appliedPromotion.discountValue
            : basePrice;
    
        const finalPrice = Math.round(promotionPrice * (1 - line.discount / 100));
    
        return finalPrice * line.quantity;
    };

    const totalAmount = cart.reduce((sum, line) => sum + calculateLineTotal(line), 0);

    // -- Handle payment method change --------------------------------------------------------
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

    const isDebt = form.paymentMethod === PaymentMethod.DEBIT;

    const returnMoney = form.customerMoney > totalAmount ? form.customerMoney - totalAmount : 0;

    const debtAmount = totalAmount > form.customerMoney ? totalAmount - form.customerMoney : 0;

    const displayLabel = isDebt ? "Số tiền còn nợ" : "Số tiền hoàn trả";
    const displayAmount = isDebt ? debtAmount : returnMoney;

    // -- Handle create sale order ------------------------------------------------------------
    const createSaleOrderMutation = useMutation({

    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(cart);
    }

    // -- Render ------------------------------------------------------------------------------

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

            {selectedCustomer ? (
                <div className="flex flex-col gap-y-5">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-tgray9">Tên khách hàng</div>
                        <div className="text-sm">{selectedCustomer.customerName}</div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-tgray9">Số điện thoại</div>
                        <div className="text-sm">{selectedCustomer.customerPhone}</div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            className={`py-2 px-4 rounded-lg border border-red-500 text-red-500 text-sm font-medium transition hover:bg-red-50 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                            onClick={() => {
                                setSelectedCustomer(null);
                                setField("customerName", "");
                                setField("customerPhone", "");
                            }}
                        >
                            Đổi khách hàng
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <SearchInput<Customer>
                        label={"Tên khách hàng"}
                        placeHolder="Nhập tên khách hàng để tìm kiếm hoặc tạo mới"
                        value={form.customerName}
                        onChange={(e) => setField("customerName", e.target.value)}
                        suggestions={nameSuggestions}
                        onSuggestionClick={(item) => {
                            setSelectedCustomer(item.data);
                        }}
                        renderItem={(item) => (
                            <div className="flex justify-between items-center">
                                <p>{item.label} - {item.data.customerPhone}</p>
                            </div>
                        )}
                    />

                    <SearchInput<Customer>
                        label={"Số điện thoại khách hàng"}
                        placeHolder="Nhập số điện thoại để tìm kiếm hoặc tạo mới"
                        value={form.customerPhone}
                        onChange={(e) => setField("customerPhone", e.target.value)}
                        suggestions={phoneSuggestions}
                        onSuggestionClick={(item) => {
                            setSelectedCustomer(item.data);
                        }}
                        renderItem={(item) => (
                            <div className="flex justify-between items-center">
                                <p>{item.label} - {item.data.customerName}</p>
                            </div>
                        )}
                    />

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="py-2 px-4 rounded-lg border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateCustomer}
                        >
                            Tạo khách hàng mới
                        </button>
                    </div>
                </>
            )}

            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">Tổng tiền</div>
                <div className="text-sm font-semibold">{formatThousands(totalAmount)} VND</div>
            </div>

            <RadioInput
                label="Phương thức thanh toán"
                labelPosition="top"
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
                disabled={createSaleOrderMutation.isPending}
                className="p-2.5 w-45 self-center rounded-lg text-white font-semibold bg-purple text-base cursor-pointer hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {createSaleOrderMutation.isPending ? "Đang xử lý..." : "Xuất hóa đơn"}
            </button>
        </form>
    );
}