import { CartLine, ComboDealResponse } from "@/types/cart";
import { formatThousands } from "@/utilities/numberFormat";
import Image from "next/image";

interface PromotionSelectModalProps {
    line: CartLine;
    onApplyCombo: (combo: ComboDealResponse) => void;
}

export function PromotionSelectModal({ line, onApplyCombo }: PromotionSelectModalProps) {
    if (line.kind !== "product") return null;

    const { availableCombos, product } = line;

    return (
        <div className="w-lg flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
                <p className="text-lg font-semibold text-purple">Combo khả dụng</p>
                <p className="text-sm text-gray-500">{product.productName}</p>
            </div>

            {availableCombos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">
                    Không có combo nào khả dụng cho sản phẩm này
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {availableCombos.map((combo) => (
                        <div
                            key={combo.id}
                            className="flex flex-col gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple transition"
                        >
                            {/* Combo header */}
                            <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm">{combo.comboName}</p>
                                <p className="text-purple font-bold text-sm">
                                    {formatThousands(combo.comboPrice)} VNĐ
                                </p>
                            </div>

                            {/* Combo items */}
                            <div className="flex flex-col gap-2">
                                {combo.comboItems.map((item) => (
                                    <div key={item.product.id} className="flex items-center gap-3">
                                        <div className="relative w-14 h-14 shrink-0">
                                            <Image
                                                src={item.product.imageURL}
                                                placeholder="blur"
                                                blurDataURL="/assets/image/light-pink.png"
                                                alt=""
                                                fill
                                                className="object-cover rounded"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <p className="text-sm truncate">{item.product.productName}</p>
                                            <p className="text-xs text-gray-600">
                                                x{item.quantity} — {formatThousands(item.product.salePrice)} VNĐ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Savings */}
                            <div className="flex justify-between items-center text-xs text-gray-600 border-t pt-2">
                                <span>
                                    Giá gốc:{" "}
                                    {formatThousands(
                                        combo.comboItems.reduce(
                                            (sum, item) => sum + item.product.salePrice * item.quantity, 0
                                        )
                                    )} VNĐ
                                </span>
                                <span className="text-green-500 font-medium">
                                    Tiết kiệm:{" "}
                                    {formatThousands(
                                        combo.comboItems.reduce(
                                            (sum, item) => sum + item.product.salePrice * item.quantity, 0
                                        ) - combo.comboPrice
                                    )} VNĐ
                                </span>
                            </div>

                            {/* Apply button */}
                            <button
                                type="button"
                                onClick={() => onApplyCombo(combo)}
                                className="w-full py-2 rounded-lg bg-purple text-white text-sm font-medium hover:bg-purple/90 transition cursor-pointer"
                            >
                                Áp dụng combo
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}