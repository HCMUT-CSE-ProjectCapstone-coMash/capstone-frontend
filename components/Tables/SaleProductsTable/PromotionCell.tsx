import { CartLine } from "@/types/cart";
import { Badge } from "antd";

export function PromotionCell({ line, onOpen, isLocked }: { line: CartLine; onOpen: (line: CartLine) => void; isLocked: boolean }) {
    if (line.kind === "combo") {
        return <span className="text-purple font-semibold">{line.appliedCombo.comboName}</span>;
    }

    return (
        <Badge count={line.availableCombos.length}>
            <button
                className="py-2 px-5 rounded-lg border border-purple bg-white text-purple text-sm font-medium transition hover:bg-purple/20 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                type="button"
                onClick={() => onOpen(line)}
                disabled={isLocked}
            >
                Xem
            </button>
        </Badge>
    );
}