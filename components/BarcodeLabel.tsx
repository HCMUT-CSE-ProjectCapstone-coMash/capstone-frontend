"use client";
import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeLabelProps {
    productId: string; 
    productName: string; 
    size: string; 
    salePrice: number;
}

export function BarcodeLabel({ productId, productName, size, salePrice } : BarcodeLabelProps) {
    const barcodeRef = useRef<SVGSVGElement>(null);
    const barcodeValue = `${productId}-${size}`;

    useEffect(() => {
        if (barcodeRef.current) {
            JsBarcode(barcodeRef.current, barcodeValue, {
                format: "CODE128",
                width: 1,
                height: 25,
                displayValue: true,
                fontSize: 8,
                margin: 2,
                background: "#ffffff",
                lineColor: "#000000",
            });
        }
    }, [barcodeValue]);

    return (
        <div className="label-card">
            <p className="label-name">{productName}</p>
            <div className="label-barcode">
                <svg ref={barcodeRef} />
            </div>
            <div className="label-footer">
                <span className="label-price">{salePrice.toLocaleString("vi-VN")}₫</span>
            </div>
        </div>
    );
}

export const labelStyles = `
    @page {
        size: 50mm 40mm;
        margin: 0;
    }

    body {
        margin: 0;
        padding: 0;
    }

    .label-grid {
        display: flex;
        flex-direction: column;
    }

    .label-card {
        width: 50mm;
        height: 40mm;
        padding: 2mm 3mm;
        background: #fff;
        font-family: 'Courier New', monospace;
        page-break-after: always;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5mm;
    }

    .label-name {
        font-size: 9px;
        font-weight: 600;
        color: #111827;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: sans-serif;
    }

    .label-barcode {
        display: flex;
        justify-content: center;
        margin: 0;
    }

    .label-barcode svg {
        max-width: 100%;
        height: auto;
    }

    .label-footer {
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px dashed #e5e7eb;
        padding-top: 3mm;
    }

    .label-price {
        font-size: 10px;
        font-weight: 700;
        color: #111827;
        font-family: sans-serif;
    }

    @media print {
        .label-card {
            border: none;
        }
    }
`;