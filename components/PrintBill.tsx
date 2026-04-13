"use client";

import { useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import { SaleOrderResponse } from "@/types/saleOrder";
import { formatThousands } from "@/utilities/numberFormat";

interface PrintBillProps {
    order: SaleOrderResponse;
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
                    body {
                        font-family: 'Courier New', monospace;
                        width: 300px;
                        margin: 0 auto;
                        padding: 20px;
                        font-size: 13px;
                    }
                    h3 { text-align: center; margin-bottom: 8px; }
                    .info { margin: 4px 0; }
                    .barcode-wrapper { text-align: center; margin: 12px 0; }
                    .barcode-id { font-size: 10px; text-align: center; word-break: break-all; }
                    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
                    th, td { text-align: left; padding: 4px 0; font-size: 12px; }
                    .right { text-align: right; }
                    .divider { border: none; border-top: 1px dashed #000; margin: 8px 0; }
                    .total { font-weight: bold; font-size: 14px; }
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
                            <th>Sản phẩm</th>
                            <th className="right">SL</th>
                            <th className="right">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.details.map((d) => (
                            <tr key={d.id}>
                                <td>{d.productName} ({d.selectedSize})</td>
                                <td className="right">{d.quantity}</td>
                                <td className="right">{formatThousands(d.subTotal)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <hr className="divider" />
                <p className="total">Tổng: {formatThousands(order.totalPrice)} VND</p>
                <p className="info">Thanh toán: {order.paymentMethod}</p>
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