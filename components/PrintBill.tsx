"use client";

import React, { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import { MappedSaleOrder } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";

interface PrintBillProps {
    order: MappedSaleOrder;
}

export function PrintBill({ order }: PrintBillProps) {
    const billRef = useRef<HTMLDivElement>(null);
    const barcodeRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (barcodeRef.current) {
            JsBarcode(barcodeRef.current, order.saleOrderId, {
                format: "CODE128",
                width: 1.5,
                height: 40,
                displayValue: false,
                margin: 0,
            });
        }
    }, [order.saleOrderId]);

    const handlePrint = () => {
        if (!billRef.current) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
            <head>
                <title>Hóa đơn #${order.saleOrderId}</title>
                <style>
                    body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; font-size: 13px; }
                    h3 { text-align: center; margin-bottom: 8px; }
                    .info { margin: 4px 0; }
                    .barcode-wrapper { text-align: center; margin: 12px 0; }
                    .barcode-id { font-size: 10px; text-align: center; word-break: break-all; }
                    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
                    th { text-align: left; padding: 4px 0 8px 0; font-size: 12px; }
                    td { text-align: left; padding: 6px 0; font-size: 12px; }
                    th:first-child, td:first-child { padding-right: 6px; width: 12px; }
                    .right { text-align: right; }
                    .divider { border: none; border-top: 1px dashed #000; margin: 8px 0; }
                    .total { font-weight: bold; font-size: 14px; }
                    .combo-name { font-size: 12px; }
                    .combo-item { font-style: italic; color: #555; font-size: 11px; padding-left: 8px; }
                    .promo-label { font-style: italic; color: #555; font-size: 11px; padding-left: 8px; }
                    .promo-row td { padding-top: 0; padding-bottom: 6px; }
                    .combo-item-row td { padding-top: 2px; padding-bottom: 2px; }
                    .total { font-weight: bold; font-size: 14px; }
                    .divider { border: none; border-top: 1px dashed #000; margin: 8px 0; }
                </style>
            </head>
            <body>${billRef.current.innerHTML}</body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    const formattedDate = new Date(order.createdAt).toLocaleString("vi-VN");

    return (
        <div>
            <div ref={billRef} style={{ display: "none" }}>
                <h3>HÓA ĐƠN BÁN HÀNG</h3>

                <div className="barcode-wrapper">
                    <svg ref={barcodeRef} />
                    <p className="barcode-id">{order.saleOrderId}</p>
                </div>

                <p className="info">Ngày: {formattedDate}</p>
                <p className="info">NV: {order.createdByName}</p>
                {order.customerName && <p className="info">KH: {order.customerName}</p>}
                <hr className="divider" />

                <table>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Sản phẩm</th>
                            <th className="right">SL</th>
                            <th className="right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            let index = 1;
                            return (
                                <>
                                    {order.products.map((p) => (
                                        <React.Fragment key={p.id}>
                                            <tr>
                                                <td>{index++}</td>
                                                <td>{p.productName} ({p.selectedSize})</td>
                                                <td className="right">{p.quantity}</td>
                                                <td className="right">{formatThousands(p.subTotal)}</td>
                                            </tr>
                                            {(p.productPromotion || p.discount > 0) && (
                                                <tr className="promo-row">
                                                    <td></td>
                                                    <td colSpan={3}>
                                                        {p.productPromotion && (
                                                            <div className="promo-label">
                                                                ↳ {p.productPromotion.promotionName}: {p.productPromotion.discountValue}{p.productPromotion.discountType === "Percent" ? "%" : "đ"}
                                                            </div>
                                                        )}
                                                        {p.discount > 0 && (
                                                            <div className="promo-label">↳ Chiết khấu: {p.discount}%</div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}

                                    {order.combos.map((combo) => (
                                        <React.Fragment key={combo.id}>
                                            <tr>
                                                <td>{index++}</td>
                                                <td><span className="combo-name">{combo.comboName}</span></td>
                                                <td className="right">{combo.quantity}</td>
                                                <td className="right">{formatThousands(combo.comboPrice)}</td>
                                            </tr>
                                            {combo.items.map((item) => (
                                                <tr key={item.id} className="combo-item-row">
                                                    <td></td>
                                                    <td className="combo-item">
                                                        ↳ {item.productName} ({item.selectedSize})
                                                    </td>
                                                    <td className="right">{item.quantity}</td>
                                                    <td className="right"></td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </>
                            );
                        })()}
                    </tbody>
                </table>

                <hr className="divider" />
                {order.appliedOrderPromotion && (
                    <>
                        <p className="info" style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                            <span style={{ minWidth: 0 }}>Tổng tiền:</span>
                            <span style={{ flexShrink: 0 }}>{formatThousands(order.originalTotalPrice)}</span>
                        </p>
                        <p className="info" style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                            <span style={{ minWidth: 0, wordBreak: "break-word" }}>KM ({order.appliedOrderPromotionName}):</span>
                            <span style={{ flexShrink: 0 }}>-{formatThousands(
                                order.appliedOrderPromotion.discountType === "Percent"
                                    ? Math.min(
                                        order.originalTotalPrice * (order.appliedOrderPromotion.discountValue / 100),
                                        order.appliedOrderPromotion.maxDiscount > 0 ? order.appliedOrderPromotion.maxDiscount : Infinity
                                    )
                                    : order.appliedOrderPromotion.discountValue
                            )}</span>
                        </p>
                        <hr className="divider" />
                    </>
                )}

                <p className="total" style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ minWidth: 0 }}>Thành tiền:</span>
                    <span style={{ flexShrink: 0 }}>{formatThousands(order.totalPrice)} VNĐ</span>
                </p>

                {order.debitMoney > 0 && (
                    <p className="info" style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ minWidth: 0 }}>Còn nợ:</span>
                        <span style={{ flexShrink: 0 }}>{formatThousands(order.debitMoney)} VNĐ</span>
                    </p>
                )}

                <p className="info" style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span style={{ minWidth: 0 }}>Thanh toán:</span>
                    <span style={{ flexShrink: 0 }}>{
                        order.paymentMethod === "Cash" ? "Tiền mặt" :
                        order.paymentMethod === "Transfer" ? "Chuyển khoản" :
                        order.paymentMethod === "Debit" ? "Ghi nợ" :
                        order.paymentMethod
                    }</span>
                </p>
            </div>

            <button
                type="button"
                onClick={handlePrint}
                className="p-2.5 w-45 rounded-lg text-white font-semibold bg-green-600 text-base cursor-pointer hover:bg-green-700 transition-all"
            >
                In hóa đơn
            </button>
        </div>
    );
}