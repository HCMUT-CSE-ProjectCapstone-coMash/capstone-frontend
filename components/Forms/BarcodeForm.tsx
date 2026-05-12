"use client";

import { RootState } from "@/utilities/store";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import { formatThousands } from "@/utilities/numberFormat";
import { clearBarCode, removeBarcode, updatePrintQuantity } from "@/utilities/barcodeSlice";
import { TextInput } from "../FormInputs/TextInput";
import { TrashIcon } from "@/public/assets/Icons";
import { BarcodeLabel, labelStyles } from "../BarcodeLabel";
import { pinkPlaceholder } from "@/const/placeholder";

interface BarcodeForm {
    onClose: () => void;
}

export function BarcodeForm({ onClose } : BarcodeForm) {
    const dispatch = useDispatch();
    const barcodeEntries = useSelector((state: RootState) => state.barcode.entries); 
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        if (!printRef.current) return;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;

        printWindow.document.write(`
            <html>
                <head>
                    <title>In mã vạch</title>
                    <style>${labelStyles}</style>
                </head>
                <body>${printRef.current.innerHTML}</body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    const totalBarcodes = barcodeEntries.reduce((sum, entry) => {
        return sum + Object.values(entry.printQuantities).reduce((s, q) => s + q, 0);
    }, 0);

    return (
        <div className="w-4xl">
            <p className="text-purple text-xl font-medium text-center">In mã vạch</p>

            {barcodeEntries.length === 0 ? (
                <p className="text-center text-gray-400 mt-5">Chưa chọn sản phẩm nào</p>
            ) : (
                <div className="mt-5 flex flex-col gap-3">
                    {barcodeEntries.map((entry) => (
                        <div key={entry.id} className="p-3 rounded border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-8 h-8">
                                        <Image src={entry.imageUrl} placeholder="blur" blurDataURL={pinkPlaceholder} alt="" fill className="object-cover" unoptimized/>
                                    </div>
                                    <div>
                                        <p className="font-medium">{entry.productName}</p>
                                        <p className="text-sm text-gray-500">
                                            {entry.productId} - {entry.color} - {entry.pattern || "Không"} - {formatThousands(entry.salePrice)} VND
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => dispatch(removeBarcode({ id: entry.id }))}
                                    className="cursor-pointer"
                                >
                                    <TrashIcon width={24} height={24} className={"text-red-500"}/>
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3">
                                {entry.quantities.map((quantity) => (
                                    <div key={quantity.size} className="w-40">
                                        <TextInput
                                            label={`Size ${quantity.size} (tồn: ${quantity.quantities})`}
                                            value={String(entry.printQuantities[quantity.size] ?? 0)}
                                            placeHolder=""
                                            onChange={(e) =>
                                                dispatch(updatePrintQuantity({
                                                    id: entry.id,
                                                    size: quantity.size,
                                                    quantity: Math.max(0, Math.min(
                                                        Number(e.target.value) || 0,
                                                        quantity.quantities
                                                    )),
                                                }))
                                            }
                                            labelPosition="left"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Hidden print content */}
                    <div ref={printRef} className="hidden">
                        <div className="label-grid">
                            {barcodeEntries.flatMap((entry) =>
                                entry.quantities.flatMap((q) => {
                                    const count = entry.printQuantities[q.size] ?? 0;
                                    return Array.from({ length: count }, (_, i) => (
                                        <BarcodeLabel
                                            key={`${entry.id}-${q.size}-${i}`}
                                            productId={entry.productId}
                                            productName={entry.productName}
                                            size={q.size}
                                            salePrice={entry.salePrice}
                                        />
                                    ));
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Tổng: {totalBarcodes} mã vạch</p>
                <div className="flex items-center gap-5">
                    <button
                        disabled={totalBarcodes === 0}
                        className="w-30 py-2 px-4 rounded-lg border border-purple bg-purple text-white text-sm font-medium transition hover:bg-purple/90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handlePrint}
                    >
                        In mã vạch
                    </button>

                    <button
                        disabled={totalBarcodes === 0}
                        className="w-30 py-2 px-4 rounded-lg border border-pink text-white bg-pink text-sm font-medium transition hover:bg-pink/90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => {
                            dispatch(clearBarCode());
                            onClose();
                        }}
                    >
                        Hoàn thành
                    </button>
                </div>
            </div>
        </div>
    )
}