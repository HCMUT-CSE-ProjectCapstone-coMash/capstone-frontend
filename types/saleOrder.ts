export interface SaleProductRequest {
    productId: string,
    selectedSize: string,
    quantity: number,
    discount: number
}

export interface SaleOrderRequest {
    customerId: string;
    userId: string;
    paymentMethod: string;
    debitMoney: number;
    products: SaleProductRequest[];
}

export interface SaleOrderDetailResponse {
    id: string;
    productId: string;
    productName: string;
    selectedSize: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subTotal: number;
}

export interface SaleOrderResponse {
    id: string;
    customerId: string | null;
    customerName: string | null;
    createdBy: string;
    createdByName: string;
    paymentMethod: string;
    debitMoney: number;
    createdAt: string;
    totalPrice: number;
    details: SaleOrderDetailResponse[];
}