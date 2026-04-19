"use client";
import { useSelector } from "react-redux";
import { TextInput } from "../FormInputs/TextInput";
import { RootState } from "@/utilities/store";
import { formatThousands } from "@/utilities/numberFormat";


export function DetailCustomerByIdForm() {
    const customer = useSelector((state: RootState) => state.customer.selectedCustomer);

    return (
        <div>
            <div className="flex justify-between items-center">
                <p className="text-lg" >Thông tin khách hàng</p>
                <button
                    type="button"
                    // onClick={}
                    className="border border-pink text-pink font-medium px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-pink-50 transition-all"
                >
                    Cập nhật nợ
                </button>
            </div>
            <div className="mt-5 flex flex-col gap-5">
                <TextInput
                    disabled
                    label="Tên khách hàng"
                    placeHolder=""
                    value={customer?.customerName || ""}
                    onChange={() => {}}
                />

                <TextInput
                    disabled
                    label="Số điện thoại"
                    placeHolder=""
                    value={customer?.customerPhone || ""}
                    onChange={() => {}}
                />

                <div className="flex flex-row gap-12.5">
                    <TextInput
                        disabled
                        label="Số tiền nợ"
                        placeHolder=""
                        value={`${formatThousands(customer?.debitMoney || 0)} VND`}
                        onChange={() => {}}
                    />
                    <div className={`w-full ${(customer?.debitDays ?? 0) >= 7 ? "[&_input]:text-red" : ""}`}>
                        <TextInput
                            disabled
                            label="Số ngày nợ"
                            placeHolder=""
                            value={`${customer?.debitDays || 0} ngày`}
                            onChange={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}