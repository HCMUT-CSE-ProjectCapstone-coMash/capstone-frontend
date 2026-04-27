"use client";

import Image from "next/image";
import { TextInput } from "../FormInputs/TextInput";
import { SaleOrderResponse, SaleOrderDetailResponse } from "@/types/saleOrder";
import { formatThousands} from "@/utilities/numberFormat";
import { Column } from "@/types/UIType";
import { Table } from "../Tables/Table";
import { PaymentMethod } from "@/const/PaymentMethod";

// ===================== HELPERS =====================

const paymentOptions: { value: string, label: string }[] = [
    { value: PaymentMethod.CASH, label: "Tiền mặt" },
    { value: PaymentMethod.TRANSFER, label: "Chuyển khoản" },
    { value: PaymentMethod.DEBIT, label: "Ghi nợ" }
];

function formatDateTime(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

// ===================== SUB-COMPONENTS =====================

function DetailsTable({ details }: { details: SaleOrderDetailResponse[] }) {
    if (details.length === 0) {
        return (
            <div className="flex items-center justify-center h-16 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-400">Không có sản phẩm</p>
            </div>
        );
    }
    
    const columns: Column<SaleOrderDetailResponse>[] = [
        { title: "Tên sản phẩm", key: "productName", render: (detail) => (
            <ProductNameCell detail={detail}/>
        )},
        {title: "Kích cỡ", key: "size", render: (detail) => <span>{detail.selectedSize}</span>},
        {title: "Đơn giá", key: "unitPrice",  render: (detail) => <span>{formatThousands(detail.unitPrice)} VNĐ</span>},
        {title: "Số lượng", key: "quantity",  render: (detail) => <span>{detail.quantity}</span>},
        {title: "Chiết khấu", key: "discount",  render: (detail) => <span>{detail.discount}</span>},
        {title: "Khuyến mãi", key: "promotion",  render: (detail) => <span>{detail.productPromotion?.promotionName?? detail.comboPromotion?.comboName?? null}</span>},

    ];

    return (
        <Table
            columns={columns}
            data={details}
        />

    );
}

function ProductNameCell({ detail }: { detail: SaleOrderDetailResponse }) {
    return (
        <div className="flex items-center justify-center gap-4">
            <div className="relative w-12 h-12">
                <Image src={detail.imageUrl} placeholder="blur" blurDataURL={"/assets/image/light-pink.png"} alt="" fill className="object-cover" unoptimized/>
            </div>
            <p>{detail.productName}</p>
        </div>
    );
}

// ===================== MAIN COMPONENT =====================

interface DetailSaleOrderFormProps {
    saleOrder: SaleOrderResponse;
}

export function DetailSaleOrderForm({ saleOrder }: DetailSaleOrderFormProps) {
    // const totalBeforePromotion = saleOrder.details.reduce(
    //     (sum, i) => sum + i.unitPrice * i.quantity, 0
    // );
    // const totalAfterPromotion = saleOrder.details.reduce(
    //     (sum, i) => sum + i.subTotal, 0
    // );
    // const savedAmount = totalBeforePromotion - totalAfterPromotion;

    return (
        <div className="flex flex-col gap-8">

            {/* ── THÔNG TIN ĐƠN HÀNG ── */}
            <div>
                <div className="flex flex-col gap-5">

                    <TextInput
                        disabled
                        label="Mã đơn hàng"
                        placeHolder=""
                        value={saleOrder.saleOrderId}
                        onChange={() => {}}
                    />

                    <div className="flex items-center gap-5">
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Thời gian bán hàng"
                                placeHolder=""
                                value={formatDateTime(saleOrder.createdAt)}
                                onChange={() => {}}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Người bán hàng"
                                placeHolder=""
                                value={saleOrder.createdByName}
                                onChange={() => {}}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Khách hàng"
                                placeHolder=""
                                value={saleOrder.customerName ?? "Khách lẻ"}
                                onChange={() => {}}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Số điện thoại"
                                placeHolder=""
                                value={""}
                                onChange={() => {}}
                            />
                        </div>
                    </div>

                    {saleOrder.debitMoney > 0 && (
                        <TextInput
                            disabled
                            label="Tiền nợ"
                            placeHolder=""
                            value={formatThousands(saleOrder.debitMoney)}
                            onChange={() => {}}
                        />
                    )}
                </div>
            </div>

            {/* ── CHI TIẾT SẢN PHẨM ── */}
            <div>
                <p className="text-sm mb-2">Chi tiết sản phẩm</p>
                <DetailsTable details={saleOrder.details} />
            </div>

            {/* ── TỔNG KẾT ── */}
            <div>
                <p className="text-sm mb-2">Tổng kết</p>
                <div className="text-sm rounded-lg border border-gray-200 overflow-hidden divide-y divide-gray-100">

                    <div className="flex justify-between px-4 py-3">
                        <span>Tổng tiền</span>
                        <span className="font-semibold">{formatThousands(saleOrder.totalPrice)} VNĐ</span>
                    </div>

                    <div className="flex justify-between px-4 py-3">
                        <span>Lợi nhuận</span>
                        <span className={`font-semibold ${saleOrder.totalProfit >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {formatThousands(saleOrder.totalProfit)} VNĐ
                        </span>
                    </div>

                    <div className="flex justify-between px-4 py-3">
                        <span>Phương thức thanh toán</span>
                        {paymentOptions.find(opt => opt.value === saleOrder.paymentMethod)?.label ?? saleOrder.paymentMethod}
                    </div>
                </div>
            </div>

        </div>
    );
}