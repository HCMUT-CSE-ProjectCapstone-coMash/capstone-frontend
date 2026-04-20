import { SelectInput } from "@/components/FormInputs/SelectInput";
import { TextInput } from "@/components/FormInputs/TextInput";
import { TrashIcon } from "@/public/assets/Icons";
import { AlertType } from "@/types/alert";
import { Product } from "@/types/product";
import { DiscountType, ProductDiscountItem } from "@/types/promotion";
import { SelectOption } from "@/types/UIType";
import { addAlert } from "@/utilities/alertStore";
import { formatThousands, parseFormattedNumber } from "@/utilities/numberFormat";
import Image from "next/image";
import { useDispatch } from "react-redux";

const DISCOUNT_TYPE_OPTIONS: SelectOption[] = [
    { label: "Phần trăm (%)",   value: "Percent" },
    { label: "Số tiền cố định", value: "Fixed" },
];

function calculateDiscountedPrice(salePrice: number, discountType: DiscountType, discountValue: number): number {
    if (!discountValue || discountValue <= 0) return salePrice;

    if (discountType === "Percent") {
        const capped = Math.min(Math.max(discountValue, 0), 100);
        return Math.max(0, Math.round(salePrice * (1 - capped / 100)));
    }

    return Math.max(0, salePrice - discountValue);
}

interface SelectedProductsTableProps {
    productDiscounts: ProductDiscountItem[];
    productCache: Record<string, Product>;
    onUpdate: (productId: string, patch: Partial<ProductDiscountItem>) => void;
    onRemove: (productId: string) => void;
}

export function SelectedProductsTable({ productDiscounts, productCache, onUpdate, onRemove } : SelectedProductsTableProps) {
    const dispatch = useDispatch();

    const handleDiscountValueChange = (item: ProductDiscountItem, rawValue: string) => {
        const product = productCache[item.productId];
        const parsed = parseFormattedNumber(rawValue);

        if (item.discountType === "Percent" && parsed > 100) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Phần trăm giảm không được vượt quá 100%." }));
            onUpdate(item.productId, { discountValue: 100 });
            return;
        }

        if (item.discountType === "Fixed" && product && parsed > product.salePrice) {
            dispatch(addAlert({ type: AlertType.WARNING, message: `Số tiền giảm không được vượt quá giá bán (${formatThousands(product.salePrice)} VNĐ).` }));
            onUpdate(item.productId, { discountValue: product.salePrice });
            return;
        }

        onUpdate(item.productId, { discountValue: Math.max(0, parsed) });
    };

    const handleDiscountTypeChange = (item: ProductDiscountItem, newType: DiscountType) => {
        const product = productCache[item.productId];
        const patch: Partial<ProductDiscountItem> = { discountType: newType };

        if (newType === "Percent" && item.discountValue > 100) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Giá trị giảm đã được điều chỉnh về 100% cho phù hợp với loại giảm mới." }));
            patch.discountValue = 100;
        } else if (newType === "Fixed" && product && item.discountValue > product.salePrice) {
            dispatch(addAlert({ type: AlertType.WARNING, message: `Giá trị giảm đã được điều chỉnh về ${formatThousands(product.salePrice)} VNĐ cho phù hợp với giá bán.` }));
            patch.discountValue = product.salePrice;
        }

        onUpdate(item.productId, patch);
    };

    return (
        <div className="rounded-lg border-[0.5px] border-tgray5 overflow-hidden">
            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-tgray9 text-left">
                        <th className="px-4 py-3 font-normal">Sản phẩm</th>
                        <th className="px-4 py-3 font-normal w-48">Loại giảm</th>
                        <th className="px-4 py-3 font-normal w-48">Giá trị giảm</th>
                        <th className="px-4 py-3 font-normal w-64">Giá sau giảm</th>
                        <th className="px-4 py-3 w-15"></th>
                    </tr>
                </thead>

                <tbody>
                    {productDiscounts.map((item) => {
                        const product = productCache[item.productId];

                        const discountedPrice = product ? calculateDiscountedPrice(product.salePrice, item.discountType, item.discountValue) : 0;

                        const hasDiscount = product && item.discountValue > 0 && discountedPrice !== product.salePrice;

                        return (
                            <tr key={item.productId} className="border-t border-tgray5 align-middle">
                                <td className="px-4 py-3">
                                    {product && (
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-20 h-20 shrink-0">
                                                <Image
                                                    src={product.imageURL}
                                                    placeholder="blur"
                                                    blurDataURL={"/assets/image/light-pink.png"}
                                                    alt=""
                                                    fill
                                                    className="object-cover rounded"
                                                    unoptimized
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{product.productName}</p>

                                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                                                    {product.quantities.map((quantity) => (
                                                        <div key={quantity.size} className="flex items-center gap-1 text-sm">
                                                            <span className="font-medium">{quantity.size}:</span>
                                                            <span className="text-purple font-bold">{quantity.quantities}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-1 flex gap-4 text-tgray9">
                                                    <span>Giá nhập: {formatThousands(product.importPrice)} VNĐ</span>
                                                    <span>Giá bán: {formatThousands(product.salePrice)} VNĐ</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </td>

                                <td className="px-4 py-3 w-48">
                                    <SelectInput
                                        label=""
                                        value={item.discountType}
                                        onChange={(v) => handleDiscountTypeChange(item, v as DiscountType)}
                                        options={DISCOUNT_TYPE_OPTIONS}
                                    />
                                </td>

                                <td className="px-4 py-3 w-48">
                                    <TextInput
                                        label=""
                                        value={formatThousands(item.discountValue)}
                                        placeHolder="0"
                                        inputType="text"
                                        onChange={(e) => handleDiscountValueChange(item, e.target.value)}
                                    />
                                </td>

                                <td className="px-4 pt-4 w-64">
                                    {product && (
                                        hasDiscount ? (
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="text-red-500 line-through">
                                                    {formatThousands(product.salePrice)} VNĐ
                                                </span>
                                                <span>→</span>
                                                <span className="text-purple font-bold">
                                                    {formatThousands(discountedPrice)} VNĐ
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-tgray9 text-sm">
                                                {formatThousands(product.salePrice)} VNĐ
                                            </span>
                                        )
                                    )}
                                </td>

                                <td className="px-4 pt-4 w-15 text-center">
                                    <button
                                        type="button"
                                        onClick={() => onRemove(item.productId)}
                                        className="cursor-pointer"
                                    >
                                        <TrashIcon width={24} height={24} className="text-red"/>
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}