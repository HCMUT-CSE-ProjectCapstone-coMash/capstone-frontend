import { sizesLetter, sizesNumber } from "@/const/product";
import { CartLine } from "@/types/cart";
import Image from "next/image";
import { TextInput } from "../FormInputs/TextInput";
import { parseFormattedNumber } from "@/utilities/numberFormat";

interface ComboSizeModalProps {
    line: CartLine;
    lineIndex: number;
    onSlotQuantityChange: (lineIndex: number, slotIndex: number, size: string, newQuantity: number) => void;
}

const sortSizes = (sizes: string[], sizeType: "Letter" | "Number"): string[] => {
    const ORDER = sizeType === "Letter" ? sizesLetter : sizesNumber;
    return [...sizes].sort((a, b) => {
        const indexA = ORDER.indexOf(a);
        const indexB = ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};

export function ComboSizeModal({ line, lineIndex, onSlotQuantityChange }: ComboSizeModalProps) {
    if (line.kind !== "combo") return null;

    return (
        <div className="w-lg flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-1 pb-3 border-b">
                <p className="text-lg font-semibold text-purple">Lựa chọn kích cỡ</p>
                <p className="text-sm text-gray-600">{line.appliedCombo.comboName}</p>
            </div>

            <div className="flex flex-col gap-3">
                {line.itemSlots.map((slot, slotIndex) => {
                    const totalSelected = slot.selectedQuantity.reduce((sum, q) => sum + q.quantities, 0);
                    const isComplete = totalSelected === slot.requiredQuantity;

                    return (
                        <div 
                            key={slotIndex}
                            className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple transition"
                        >
                            {/* Product header */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-14 h-14 shrink-0">
                                        <Image
                                            src={slot.product.imageURL}
                                            placeholder="blur"
                                            blurDataURL="/assets/image/light-pink.png"
                                            alt=""
                                            fill
                                            className="object-cover rounded"
                                            unoptimized
                                        />
                                    </div>
                                    <p className="text-sm truncate">{slot.product.productName}</p>
                                </div>

                                {/* Progress chip */}
                                <div
                                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums transition-colors ${
                                        isComplete
                                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                                            : "bg-purple/10 text-purple ring-1 ring-purple/20"
                                    }`}
                                >
                                    {totalSelected} / {slot.requiredQuantity}
                                </div>
                            </div>
                            
                            {/* Size inputs */}
                            <div className="grid grid-cols-3 gap-x-10 gap-y-5">
                                {sortSizes(slot.selectedQuantity.map(q => q.size), slot.product.sizeType).map((size) => {
                                    const sizeEntry = slot.selectedQuantity.find(q => q.size === size);
                                    const currentValue = sizeEntry?.quantities ?? 0;

                                    return (
                                        <TextInput
                                            key={size}
                                            label={size}
                                            labelPosition="left"
                                            placeHolder="0"
                                            value={currentValue}
                                            onChange={(e) => {
                                                onSlotQuantityChange(lineIndex, slotIndex, size, parseFormattedNumber(e.target.value) || 0);
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}