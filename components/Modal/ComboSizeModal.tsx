import { CartLine } from "@/types/cart";

interface ComboSizeModalProps {
    line: CartLine;
}

export function ComboSizeModal({ line }: ComboSizeModalProps) {
    if (line.kind !== "combo") return null;

    return (
        <div className="w-lg flex flex-col gap-4 max-h-[70vh] overflow-y-auto">

        </div>
    )
}