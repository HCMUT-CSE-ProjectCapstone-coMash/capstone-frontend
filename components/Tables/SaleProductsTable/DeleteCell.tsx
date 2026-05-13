import { TrashIcon } from "@/public/assets/Icons";
import { AlertType } from "@/types/alert";
import { CartLine } from "@/types/cart";
import { addAlert } from "@/utilities/alertStore";
import { useDispatch } from "react-redux";

type DeleteCellProps = {
    line: CartLine;
    lineIndex: number;
    onRemove: (lineIndex: number) => void;
    isLocked: boolean;
}

export function DeleteCell({ line, lineIndex, onRemove, isLocked }: DeleteCellProps) {
    const dispatch = useDispatch();

    return (
        <button
            className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
            onClick={() => {
                onRemove(lineIndex);
                const name = line.kind === "product" ? line.product.productName : line.appliedCombo.comboName;
                dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã xoá "${name}" khỏi giỏ hàng` }));
            }}
            disabled={isLocked}
        >
            <TrashIcon width={24} height={24} className={"text-red-500"}/>
        </button>
    );
}