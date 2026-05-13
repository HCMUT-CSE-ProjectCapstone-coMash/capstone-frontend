import { CartLine } from "@/types/cart";
import { Product } from "@/types/product";
import { sortSizes } from "@/utilities/cart";

const getRemainingStock = (cart: CartLine[], productId: string, size: string, totalStock: number): number => {
    const used = cart.reduce((total, line) => {
        if (line.kind === "product") {
            if (line.product.id === productId && line.selectedSize === size) {
                return total + line.quantity;
            }
            return total;
        }

        return total + line.itemSlots.reduce((slotSum, slot) => {
            if (slot.product.id !== productId) return slotSum;
            const sizeQty = slot.selectedQuantity.find(q => q.size === size);
            return slotSum + (sizeQty?.quantities ?? 0);
        }, 0);
    }, 0);

    return totalStock - used;
};

export function StockCell({ line, cart }: { line: CartLine; cart: CartLine[] }) {
    if (line.kind === "product") {
        return (
            <div className="flex flex-col items-center">
                <ProductStockList product={line.product} cart={cart} />
            </div>
        );
    }

    return (
        <div className="flex flex-col justify-center items-center gap-3">
            {line.itemSlots.map((slot, slotIndex) => (
                <div key={slotIndex} className="flex flex-col items-center justify-center">
                    <p className="text-xs text-gray-500 truncate mb-1">
                        {slot.product.productName}
                    </p>
                    <ProductStockList product={slot.product} cart={cart} />
                </div>
            ))}
        </div>
    );
}

function ProductStockList({ product, cart }: { product: Product; cart: CartLine[] }) {
    const sortedSizes = sortSizes(
        product.quantities.map((q) => q.size),
        product.sizeType
    );

    const stockBySize = sortedSizes.map((size) => {
        const sizeEntry = product.quantities.find((q) => q.size === size)!;
        return {
            size,
            remaining: getRemainingStock(cart, product.id, size, sizeEntry.quantities),
        };
    });

    const hasAnyStock = stockBySize.some((s) => s.remaining > 0);

    if (!hasAnyStock) {
        return <span className="text-sm text-red-500 font-medium">Hết hàng</span>;
    }

    return (
        <>
            {stockBySize.map(({ size, remaining }) =>
                remaining > 0 ? (
                    <div key={size} className="flex justify-center items-center gap-2 text-sm">
                        <span className="font-medium">{size}:</span>
                        <span className="text-purple font-bold">{remaining}</span>
                    </div>
                ) : null
            )}
        </>
    );
}