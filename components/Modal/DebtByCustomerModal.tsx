"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { FetchDebtSaleOrdersByCustomer } from "@/api/saleOrders.ts/saleOrders"; // adjust path
// TODO: import UpdateCustomerDebt khi BE có endpoint
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { Customer } from "@/types/customer";

interface DebtModalProps {
    customer: Customer;
    onClose: () => void;
}

export function DebtByCustomerModal({ customer, onClose }: DebtModalProps) {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [reduceAmount, setReduceAmount] = useState<string>("");

    const { data: debtOrders = [], isLoading } = useQuery<{
        id: string;
        saleOrderId: string;
        createdAt: string;
        createdByName: string;
        totalPrice: number;
        debitMoney: number;
    }[]>({
        queryKey: ["debtOrders", customer.id],
        queryFn: () => FetchDebtSaleOrdersByCustomer(customer.id),
        enabled: !!customer.id,
        refetchOnWindowFocus: false,
    });

    const updateDebtMutation = useMutation({
        mutationFn: async () => {
            // TODO: thay bằng API thực khi BE có endpoint
            // await UpdateCustomerDebt(customer.id, parsedAmount);
            throw new Error("Chưa có API cập nhật nợ");
        },
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật nợ thành công" }));
            queryClient.invalidateQueries({ queryKey: ["debtOrders", customer.id] });
            setReduceAmount("");
            onClose();
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật nợ thất bại" }));
        },
    });

    const parsedAmount = parseFormattedNumber(reduceAmount);
    const totalDebt = customer.debitMoney ?? 0;
    const isAmountValid = parsedAmount > 0 && parsedAmount <= totalDebt;

    const handleSubmit = () => {
        if (!isAmountValid) {
            dispatch(
                addAlert({
                    type: AlertType.WARNING,
                    message:
                        parsedAmount <= 0
                            ? "Vui lòng nhập số tiền hợp lệ"
                            : "Số tiền giảm không được vượt quá tổng nợ",
                })
            );
            return;
        }
        updateDebtMutation.mutate();
    };

    const sortedDebtOrders = [...debtOrders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return (
        <div className="w-2xl flex flex-col gap-5 max-h-[80vh]">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <p className="text-xl font-medium text-purple">Cập nhật nợ</p>
                <p className="text-sm text-black">
                    {customer.customerName} - {" "}
                    <span className="text-pink font-medium">
                        Tổng nợ: {formatThousands(totalDebt)} VNĐ
                    </span>
                </p>
            </div>

            {/* Input giảm nợ */}
            <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold">Nhập số tiền khách trả</p>

                <div className="flex items-center gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            value={reduceAmount ? formatThousands(parsedAmount) : ""}
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "");
                                setReduceAmount(raw);
                            }}
                            placeholder="0"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm pr-12
                                       focus:outline-none focus:border-purple transition
                                       placeholder:text-tgray05"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            VNĐ
                        </span>
                    </div>

                    {/* Nút trả hết */}
                    <button
                        type="button"
                        className="shrink-0 px-3 py-2.5 rounded-lg border border-purple text-purple text-sm
                                   hover:bg-purple/5 transition cursor-pointer whitespace-nowrap"
                        onClick={() => setReduceAmount(String(totalDebt))}
                    >
                        Trả hết
                    </button>
                </div>

                {/* Preview sau khi trả */}
                {parsedAmount > 0 && isAmountValid && (
                    <p className="text-xs text-tgray6">
                        Số nợ còn lại:{" "}
                        <span className="text-purple font-medium">
                            {formatThousands(totalDebt - parsedAmount)} VNĐ
                        </span>
                    </p>
                )}

                {parsedAmount > totalDebt && (
                    <p className="text-xs text-red">
                        Số tiền vượt quá tổng nợ ({formatThousands(totalDebt)} VNĐ)
                    </p>
                )}
            </div>

            {/* Danh sách đơn hàng có nợ */}
            <div className="flex flex-col gap-2 overflow-y-auto flex-1 pr-1">
                <p className="text-sm font-semibold">Danh sách đơn hàng còn nợ</p>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-2 border-purple border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : sortedDebtOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-1 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-sm">Không có đơn hàng nào còn nợ</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {sortedDebtOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <p className="font-medium text-sm">{order.saleOrderId}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                        {" - "}
                                        {order.createdByName}
                                    </p>
                                </div>

                                <div className="flex flex-col items-end gap-0.5">
                                    <p className="text-sm text-gray-500">
                                        Tổng đơn:{" "}
                                        <span className="text-gray-800 font-medium">
                                            {formatThousands(order.totalPrice)} VNĐ
                                        </span>
                                    </p>
                                    <p className="text-sm text-pink font-semibold">
                                        Còn nợ: {formatThousands(order.debitMoney)} VNĐ
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm
                               hover:bg-gray-50 transition cursor-pointer"
                >
                    Huỷ
                </button>
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={updateDebtMutation.isPending || !isAmountValid}
                    className="px-4 py-2 rounded-lg bg-pink text-white text-sm
                               disabled:opacity-60 disabled:cursor-not-allowed
                               hover:bg-pink/90 transition cursor-pointer"
                >
                    {updateDebtMutation.isPending ? "Đang cập nhật..." : "Xác nhận"}
                </button>
            </div>
        </div>
    );
}