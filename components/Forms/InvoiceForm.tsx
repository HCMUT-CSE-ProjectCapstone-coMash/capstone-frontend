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
import { MappedSaleOrder, mapSaleOrder, SaleComboRequest, SaleOrderRequest, SaleProductRequest } from "@/types/saleOrder";
import { CreateSaleOrder } from "@/api/saleOrders.ts/saleOrders";
import { useDebounce } from "@/hooks/useDebounce";
import { CartLine, OrderPromotionLevelResponse, OrderPromotionResponse } from "@/types/cart";
import { PrintBill } from "../PrintBill";
import { FetchOrderPromotions } from "@/api/promotions/promotions";
import { Tooltip } from "antd";

const paymentOptions: { value: string, label: string }[] = [
    { value: PaymentMethod.CASH, label: "Tiền mặt" },
    { value: PaymentMethod.TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.DEBIT, label: "Ghi nợ" }
];

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

interface InvoiceFormProps {
    cart: CartLine[];
    isLocked: boolean;
    onOrderComplete: () => void;
    onReset: () => void;
}

function mapCartToSaleOrderRequest(cartLines: CartLine[], customerId: string, userId: string, paymentMethod: PaymentMethod, debtAmount: number, orderPromotionId: string): SaleOrderRequest {
    const products: SaleProductRequest[] = [];
    const combos: SaleComboRequest[] = [];

    for (const line of cartLines) {
        if (line.kind === "product") {
            products.push({
                productId: line.product.id,
                selectedSize: line.selectedSize,
                quantity: line.quantity,
                discount: line.discount,
                promotionId: line.appliedPromotion ? line.appliedPromotion.id : ""
            })
        } else {
            combos.push({
                comboDealId: line.appliedCombo.id,
                quantity: line.quantity,
                items: line.itemSlots.flatMap(slot =>
                    slot.selectedQuantity
                        .filter(sq => sq.quantities > 0)
                        .map(sq => ({
                            productId: slot.product.id,
                            selectedSize: sq.size,
                            quantity: sq.quantities,
                        }))
                )
            })
        }
    }

    return {
        customerId,
        userId,
        paymentMethod,
        debtAmount,
        products,
        combos,
        orderPromotionId
    }
}

export function InvoiceForm({ cart, isLocked, onOrderComplete, onReset }: InvoiceFormProps) {
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
            setField("customerMoney", finalAmount);
        } else if (selectedMethod === PaymentMethod.DEBIT) {
            setField("customerMoney", 0);
        }
    };

    const isDebt = form.paymentMethod === PaymentMethod.DEBIT;

    // -- Handle create sale order ------------------------------------------------------------
    const [completedOrder, setCompletedOrder] = useState<MappedSaleOrder | null>(null);

    const createSaleOrderMutation = useMutation({
        mutationFn: (saleOrderRequest: SaleOrderRequest) => CreateSaleOrder(saleOrderRequest),
        onSuccess: (data) => {
            onOrderComplete();
            const mapped = mapSaleOrder(data);
            setCompletedOrder(mapped);
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xuất hóa đơn thành công" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Không thể tạo hóa đơn bán hàng" }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!user.id) return;
        
        const saleOrderRequest = mapCartToSaleOrderRequest(
            cart, 
            selectedCustomer ? selectedCustomer.id : "", 
            user.id, 
            form.paymentMethod, 
            debtAmount,
            appliedOrderPromotion ? appliedOrderPromotion.level.id : ""
        );

        createSaleOrderMutation.mutate(saleOrderRequest);
    }

    const handleReset = () => {
        setCompletedOrder(null);
        setSelectedCustomer(null);
        setForm(initialInvoiceFormState);
        onReset();
    }

    // -- Fetch order promotions ----------------------------------------------------------------
    const findBestOrderPromotion = (total: number, promotions: OrderPromotionResponse[]) : { promotion: OrderPromotionResponse; level: OrderPromotionLevelResponse } | null => {
        let best: { promotion: OrderPromotionResponse, level: OrderPromotionLevelResponse, saving: number } | null = null;

        for (const promotion of promotions) {
            for (const level of promotion.levels) {
                if (total < level.minValue) continue;

                const saving = level.discountType === "Percent" 
                    ? Math.min(total * (level.discountValue / 100), level.maxDiscount || Infinity)
                    : level.discountValue;

                if (!best || saving > best.saving) {
                    best = { promotion, level, saving };
                }
            }
        }

        return best ? { promotion: best.promotion, level: best.level } : null;
    }

    const { data: orderPromotions } = useQuery({
        queryKey: ["orderPromotions"],
        queryFn: FetchOrderPromotions,
        refetchOnWindowFocus: false
    });

    const appliedOrderPromotion = orderPromotions ? findBestOrderPromotion(totalAmount, orderPromotions) : null;

    const orderDiscount = appliedOrderPromotion
        ? appliedOrderPromotion.level.discountType === "Percent"
            ? Math.min(totalAmount * (appliedOrderPromotion.level.discountValue / 100), appliedOrderPromotion.level.maxDiscount || Infinity)
            : appliedOrderPromotion.level.discountValue
        : 0;

    const finalAmount = totalAmount - orderDiscount;

    const returnMoney = form.customerMoney > finalAmount ? form.customerMoney - finalAmount : 0;
    const debtAmount = finalAmount > form.customerMoney ? finalAmount - form.customerMoney : 0;

    const displayLabel = isDebt ? "Số tiền còn nợ" : "Số tiền hoàn trả";
    const displayAmount = isDebt ? debtAmount : returnMoney;

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
                            disabled={isLocked || createSaleOrderMutation.isPending}
                        >
                            Đổi khách hàng
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <SearchInput<Customer>
                        label={"Tên khách hàng"}
                        placeHolder="Tìm kiếm hoặc tạo mới"
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
                        disabled={isLocked || createSaleOrderMutation.isPending}
                    />

                    <SearchInput<Customer>
                        label={"Số điện thoại khách hàng"}
                        placeHolder="Tìm kiếm hoặc tạo mới"
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
                        disabled={isLocked || createSaleOrderMutation.isPending}
                    />

                    <div className="flex justify-end">
                        <button
                            type="button"
                            className="py-2 px-4 rounded-lg border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={handleCreateCustomer}
                            disabled={isLocked || createSaleOrderMutation.isPending}
                        >
                            Tạo khách hàng mới
                        </button>
                    </div>
                </>
            )}

            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">Tổng tiền</div>
                <div className="text-sm font-semibold">{formatThousands(totalAmount)} VNĐ</div>
            </div>

            {appliedOrderPromotion && (
                <div className="flex flex-row justify-between items-center">
                    <Tooltip
                        title={
                            <div className="flex flex-col gap-1 text-xs">
                                <div className="flex justify-between gap-6">
                                    <span className="text-white/60">Khuyến mãi</span>
                                    <span>{appliedOrderPromotion.promotion.promotionName}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <span className="text-white/60">Mã</span>
                                    <span>{appliedOrderPromotion.promotion.promotionId}</span>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <span className="text-white/60">Đơn tối thiểu</span>
                                    <span>{formatThousands(appliedOrderPromotion.level.minValue)} VNĐ</span>
                                </div>
                                <div className="flex justify-between gap-6 text-orange-400">
                                    <span>
                                        Giảm ({appliedOrderPromotion.level.discountType === "Percent"
                                            ? `-${appliedOrderPromotion.level.discountValue}%`
                                            : `-${formatThousands(appliedOrderPromotion.level.discountValue)} VNĐ`})
                                    </span>
                                    <span>-{formatThousands(orderDiscount)} VNĐ</span>
                                </div>
                                {appliedOrderPromotion.level.discountType === "Percent" && appliedOrderPromotion.level.maxDiscount > 0 && (
                                    <div className="flex justify-between gap-6">
                                        <span className="text-white/60">Giảm tối đa</span>
                                        <span>{formatThousands(appliedOrderPromotion.level.maxDiscount)} VNĐ</span>
                                    </div>
                                )}
                                <div className="flex justify-between gap-6 border-t border-white/30 pt-1 font-bold">
                                    <span>Thành tiền</span>
                                    <span>{formatThousands(finalAmount)} VNĐ</span>
                                </div>
                            </div>
                        }
                        placement="left"
                    >
                        <p className="text-sm text-tgray9 underline decoration-dashed cursor-help">
                            Khuyến mãi đơn hàng
                        </p>
                    </Tooltip>
                    <p className="text-sm font-semibold text-green-600">
                        -{formatThousands(orderDiscount)} VNĐ
                    </p>
                </div>
            )}

            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">Thành tiền</div>
                <div className="text-sm font-semibold text-purple">{formatThousands(finalAmount)} VNĐ</div>
            </div>

            <RadioInput
                label="Hình thức thanh toán"
                labelPosition="top"
                options={paymentOptions}
                value={form.paymentMethod}
                onChange={handlePaymentMethodChange} 
                disabled={isLocked || createSaleOrderMutation.isPending}
            />

            <div className="flex flex-row justify-between items-center">
                <p className="text-sm text-tgray9">Số tiền khách đưa</p>
                <div className="relative w-35">
                    <TextInput
                        label=""
                        placeHolder="0" 
                        value={formatThousands(form.customerMoney)} 
                        onChange={(e) => setField("customerMoney", parseFormattedNumber(e.target.value))} 
                        disabled={isLocked || createSaleOrderMutation.isPending}
                    />
                    <span className="absolute right-3 bottom-4 text-sm text-tgray9 pointer-events-none">
                        VNĐ
                    </span>
                </div>
            </div>
            
            {/* --- CẬP NHẬT HIỂN THỊ LABEL VÀ AMOUNT --- */}
            <div className="flex flex-row justify-between items-center">
                <div className="text-sm text-tgray9">{displayLabel}</div>
                <div className="text-sm font-semibold">{formatThousands(displayAmount)} VNĐ</div>
            </div>

            {completedOrder ? (
                <div className="flex gap-3 self-center">
                    <PrintBill order={completedOrder}/>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="p-2.5 w-45 rounded-lg text-purple font-semibold border border-purple text-base cursor-pointer hover:bg-purple/10 transition-all"
                    >
                        Tạo đơn mới
                    </button>
                </div>
            ) : (
                <button
                    type="submit"
                    onClick={handleSubmit}
                    disabled={createSaleOrderMutation.isPending}
                    className="p-2.5 w-45 self-center rounded-lg text-white font-semibold bg-purple text-base cursor-pointer hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {createSaleOrderMutation.isPending ? "Đang xử lý..." : "Xuất hóa đơn"}
                </button>
            )}
        </form>
    );
}