export const MAX_PRICE = 100_000_000;
export const MAX_QUANTITY = 100;
export const MAX_STRING = 75;

export const formatThousands = (value: number | string) => {
    const num = String(value).replace(/\D/g, ""); // strip non-digits
    if (!num) return "";
    return Number(num).toLocaleString("vi-VN"); // e.g. 1.000.000
};

export const parseFormattedNumber = (value: string) => {
    return Number(value.replace(/\D/g, "")) || 0;
};

export const clampPrice = (value: number) =>
    Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), MAX_PRICE);

export const clampQuantity = (value: number) =>
    Math.min(Math.max(Number.isFinite(value) ? value : 0, 0), MAX_QUANTITY);