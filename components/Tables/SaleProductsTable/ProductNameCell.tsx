import { pinkPlaceholder } from "@/const/placeholder";
import { CartLine } from "@/types/cart";
import Image from "next/image";

export function ProductNameCell({ line }: { line: CartLine }) {
    if (line.kind === "product") {
        return (
            <div className="flex items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                    <Image src={line.product.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} alt="" fill className="object-cover" unoptimized/>
                </div>
                <p>{line.product.productName}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-2">
            {line.appliedCombo.comboItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="relative w-12 h-12">
                        <Image src={item.product.imageURL} placeholder="blur" blurDataURL={pinkPlaceholder} alt="" fill className="object-cover" unoptimized/>
                    </div>
                    <p>{item.product.productName}</p>
                </div>
            ))}
        </div>
    );
}