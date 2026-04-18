export interface Customer {
    id: string;
    customerName: string;
    customerPhone: string;
    customerStatus: "active" | "inactive";
    createdAt: string;
    debitMoney?: number; // Có thể không nợ
    debitDays?: number;   // Số ngày nợ
}