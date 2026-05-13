import { Cell } from "@/components/Cell";
import { AlertType } from "@/types/alert";
import { CartLine } from "@/types/cart";
import { addAlert } from "@/utilities/alertStore";
import { useDispatch } from "react-redux";

type DiscountCellProps = {
    line: CartLine;
    lineIndex: number;
    onDiscountChange: (lineIndex: number, discount: number) => void;
    isLocked: boolean;
}

export function DiscountCell({ line, lineIndex, onDiscountChange, isLocked }: DiscountCellProps) {
    const dispatch = useDispatch();

    if (line.kind !== "product") return <div></div>;

    return (
        <Cell
            isPercentage={true}
            value={line.discount}
            onSave={(value) => {
                if (value < 0 || value > 100) {
                    dispatch(addAlert({ type: AlertType.WARNING, message: "Chiết khấu phải từ 0% đến 100%" }));
                    return;
                }
                onDiscountChange(lineIndex, value);
                dispatch(addAlert({ type: AlertType.SUCCESS, message: `Đã cập nhật chiết khấu thành ${value}%` }));
            }}
            disabled={isLocked}
        />
    );
}
