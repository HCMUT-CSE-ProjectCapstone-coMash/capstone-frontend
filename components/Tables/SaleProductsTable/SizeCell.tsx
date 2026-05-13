import { SelectInput } from "@/components/FormInputs/SelectInput";
import { CartLine } from "@/types/cart";
import { sortSizes } from "@/utilities/cart";
import { Badge } from "antd";

interface SizeCellProps {
    line: CartLine;
    onSizeChange: (lineIndex: number, newSize: string) => void;
    lineIndex: number;
    onOpenComboSize: () => void;
    isLocked: boolean;
}

export function SizeCell({ line, onSizeChange, lineIndex, onOpenComboSize, isLocked }: SizeCellProps) {
    if (line.kind === "product") {
        return (
            <div className="w-16 mx-auto">
                <SelectInput
                    label=""
                    options={sortSizes(line.product.quantities.map((q) => q.size), line.product.sizeType).map((size) => ({ label: size, value: size }))}
                    value={line.selectedSize}
                    onChange={(value) => onSizeChange(lineIndex, value)}
                    noDefaultOption={true}
                    disabled={isLocked}
                />
            </div>
        );
    }

    const missingCount = line.itemSlots.reduce((sum, slot) => {
        const selectedTotal = slot.selectedQuantity.reduce((s, q) => s + q.quantities, 0);
        const diff = slot.requiredQuantity - selectedTotal;
        return sum + Math.max(diff, 0);
    }, 0);

    return (
        <Badge count={missingCount}>
            <button
                className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                onClick={onOpenComboSize}
                disabled={isLocked}
            >
                Xem
            </button>
        </Badge>
    );
}