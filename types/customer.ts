export interface Customer {
    id: string;
    fullName: string;
    phoneNumber: string;
    debtAmount?: number; // Có thể không nợ
    debtDays?: number;   // Số ngày nợ
}