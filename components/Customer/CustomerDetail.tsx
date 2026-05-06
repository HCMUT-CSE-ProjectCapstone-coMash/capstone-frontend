"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { Customer } from "@/types/customer";
import { formatThousands } from "@/utilities/numberFormat";
import { LayoutModal } from "../Modal/LayoutModal";
import { DebtByCustomerModal } from "../Modal/DebtByCustomerModal";


// ===================== MAIN COMPONENT =====================

interface CustomerDetailProps {
    customer: Customer ;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
    const [debtModalOpen, setDebtModalOpen] = useState(false);
    return (
        <div>
            <div className="flex justify-between items-center mb-2">
                <p className="text-lg" >Thông tin khách hàng</p>
                <button
                    type="button"
                    onClick={() => setDebtModalOpen(true)}
                    className="border border-pink text-pink font-medium px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-pink-50 transition-all"
                >
                    Cập nhật nợ
                </button>
            </div>
            <div className="flex flex-col gap-8">
            {/* ── THÔNG TIN KHÁCH HÀNG ── */}
                <div className="flex flex-col gap-5">
                    <TextInput
                        disabled
                        label="Tên khách hàng"
                        placeHolder=""
                        value={customer?.customerName || "Khách vãng lai"}
                        onChange={() => {}}
                    />
                    <TextInput
                        disabled
                        label="Số điện thoại"
                        placeHolder=""
                        value={customer?.customerPhone || ""}
                        onChange={() => {}}
                    />

                    <div className="flex items-center gap-5">
                       
                        <TextInput
                            disabled
                            label="Số tiền nợ"
                            placeHolder=""
                            value={`${formatThousands(customer?.debitMoney || 0)} VNĐ`}
                            onChange={() => {}}
                        />
                        
                        <div className={`w-full ${(customer?.debitDays ?? 0) >= 7 ? "[&_input]:text-red font-semibold" : ""}`}>
                            <TextInput
                                disabled
                                label="Số ngày nợ"
                                placeHolder=""
                                value={`${customer?.debitDays} ngày`}
                                onChange={() => {}}
                            />
                        </div>

                    </div>
                </div>
            </div>
            {debtModalOpen && (
                <LayoutModal
                    isOpen={debtModalOpen}
                    onClose={() => setDebtModalOpen(false)}
                >
                    <DebtByCustomerModal
                        customer={customer}
                        onClose={() => setDebtModalOpen(false)}
                    />
                </LayoutModal>
            )}
        </div>
    );
}