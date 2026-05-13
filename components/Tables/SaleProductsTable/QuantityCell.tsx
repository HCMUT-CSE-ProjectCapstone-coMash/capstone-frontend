import { AddIcon, MinusIcon } from "@/public/assets/Icons";
import { AlertType } from "@/types/alert";
import { CartLine } from "@/types/cart";
import { addAlert } from "@/utilities/alertStore";
import { useDispatch } from "react-redux";

interface QuantityCellProps {
    line: CartLine;
    lineIndex: number;
    availableQuantity: number;
    onQuantityChange: (lineIndex: number, newQuantity: number) => void;
    isLocked: boolean;
}

export function QuantityCell({ line, lineIndex, availableQuantity, onQuantityChange, isLocked }: QuantityCellProps) {
    const dispatch = useDispatch();

    return (
        <div className="flex items-center justify-center gap-4">
            <button
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => {
                    onQuantityChange(lineIndex, line.quantity - 1);
                    if (line.quantity - 1 <= 0) {
                        dispatch(addAlert({ type: AlertType.WARNING, message: "Đã xoá sản phẩm khỏi giỏ hàng" }));
                    } else {
                        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đã giảm số lượng" }));
                    }
                }}
                disabled={isLocked}
            >
                <MinusIcon width={24} height={24} className=""/>
            </button>
            <p>{line.quantity}</p>
            <button
                className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
                onClick={() => {
                    if (line.quantity < availableQuantity) {
                        onQuantityChange(lineIndex, line.quantity + 1);
                        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật số lượng thành công" }));
                    } else {
                        dispatch(addAlert({ type: AlertType.WARNING, message: `Số lượng tối đa là ${availableQuantity}` }));
                    }
                }}
                disabled={isLocked}
            >
                <AddIcon width={24} height={24} className=""/>
            </button>
        </div>
    );
}