import { sizesLetter, sizesNumber } from "@/const/product";

export function sortSizes(sizes: string[], sizeType: "Letter" | "Number"): string[] {
    const ORDER = sizeType === "Letter" ? sizesLetter : sizesNumber;
    return [...sizes].sort((a, b) => {
        const indexA = ORDER.indexOf(a);
        const indexB = ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};
