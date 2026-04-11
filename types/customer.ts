export interface Customer {
    customerId: string;
    customerName: string;
    customerPhone: string;
    customerStatus: "Active" | "Deleted";
    createdAt: string;
    createdBy: string;
}