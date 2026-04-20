export interface Customer {
    id: string;
    customerName: string;
    customerPhone: string;
    customerStatus: "Active" | "Deleted";
    createdAt: string;
    createdBy: string;
    debitMoney: number;
    debitDays: number;
}