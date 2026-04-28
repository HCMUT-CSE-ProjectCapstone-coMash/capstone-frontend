"use client";

import { TextInput } from "../FormInputs/TextInput";
import { Customer } from "@/types/customer";
import { formatThousands } from "@/utilities/numberFormat";


// ===================== MAIN COMPONENT =====================

interface CustomerDetailProps {
    customer: Customer ;
}

export function CustomerDetail({ customer }: CustomerDetailProps) {

    return (
        <div className="flex flex-col gap-8">
            {/* ── THÔNG TIN KHÁCH HÀNG ── */}
            <div className="flex flex-col gap-5">
                <TextInput
                    disabled
                    label="Tên khách hàng"
                    placeHolder=""
                    value={customer.customerName}
                    onChange={() => {}}
                />
                <TextInput
                    disabled
                    label="Số điện thoại"
                    placeHolder=""
                    value={customer.customerPhone}
                    onChange={() => {}}
                />

                <div className="flex items-center gap-5">
                    <div className="w-1/2">
                        <TextInput
                            disabled
                            label="Số tiền nợ"
                            placeHolder=""
                            value={formatThousands(customer.debitMoney)}
                            onChange={() => {}}
                        />
                    </div>
                    <div className="w-1/2">
                        <TextInput
                            disabled
                            label="Số ngày nợ"
                            placeHolder=""
                            value={customer.debitDays ? `${customer.debitDays} ngày` : "-"}
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>

        </div>
    );
}