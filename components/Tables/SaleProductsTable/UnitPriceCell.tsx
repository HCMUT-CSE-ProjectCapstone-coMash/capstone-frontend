import { CartLine } from "@/types/cart";
import { formatThousands } from "@/utilities/numberFormat";
import { Tooltip } from "antd";

export function UnitPriceCell({ line }: { line: CartLine }) {
    if (line.kind === "combo") {
        return <span>{formatThousands(line.appliedCombo.comboPrice)} VNĐ</span>;
    }

    const basePrice = line.product.salePrice;

    const promotionPrice = line.appliedPromotion
        ? line.appliedPromotion.discountType === "Percent"
            ? basePrice * (1 - line.appliedPromotion.discountValue / 100)
            : basePrice - line.appliedPromotion.discountValue
        : basePrice;

    const finalPrice = Math.round(promotionPrice * (1 - line.discount / 100));
    const hasAnyDiscount = !!line.appliedPromotion || line.discount > 0;

    const tooltipContent = (
        <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between gap-6">
                <span className="text-white/60">Giá gốc</span>
                <span>{formatThousands(basePrice)} VNĐ</span>
            </div>
            {line.appliedPromotion && (
                <>
                    <div className="flex justify-between gap-6 text-orange-400">
                        <span>
                            Khuyến mãi ({line.appliedPromotion.discountType === "Percent"
                                ? `-${line.appliedPromotion.discountValue}%`
                                : `-${formatThousands(line.appliedPromotion.discountValue)} VNĐ`})
                        </span>
                        <span>-{formatThousands(basePrice - promotionPrice)} VNĐ</span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className="text-white/60">Sau KM</span>
                        <span>{formatThousands(promotionPrice)} VNĐ</span>
                    </div>
                </>
            )}
            {line.discount > 0 && (
                <>
                    <div className="flex justify-between gap-6 text-blue-400">
                        <span>Chiết khấu (-{line.discount}%)</span>
                        <span>-{formatThousands(promotionPrice - finalPrice)} VNĐ</span>
                    </div>
                    <div className="flex justify-between gap-6">
                        <span className="text-white/60">Sau CK</span>
                        <span>{formatThousands(finalPrice)} VNĐ</span>
                    </div>
                </>
            )}
            <div className="flex justify-between gap-6 border-t border-white/30 pt-1 font-bold">
                <span>Thành tiền</span>
                <span>{formatThousands(finalPrice)} VNĐ</span>
            </div>
        </div>
    );

    return (
        <Tooltip title={hasAnyDiscount ? tooltipContent : null}>
            <div className="flex flex-col items-center gap-1 cursor-default">
                {hasAnyDiscount && (
                    <span className="text-gray-400 line-through text-sm">
                        {formatThousands(basePrice)} VNĐ
                    </span>
                )}
                <span className={hasAnyDiscount ? "text-purple font-bold" : ""}>
                    {formatThousands(finalPrice)} VNĐ
                </span>
            </div>
        </Tooltip>
    );
}