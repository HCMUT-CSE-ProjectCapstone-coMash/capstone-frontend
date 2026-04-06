export const formatThousands = (value: number | string) => {
    const num = String(value).replace(/\D/g, ""); // strip non-digits
    if (!num) return "";
    return Number(num).toLocaleString("vi-VN"); // e.g. 1.000.000
};

export const parseFormattedNumber = (value: string) => {
    return Number(value.replace(/\D/g, "")) || 0;
};