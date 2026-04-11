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
    discount: number,
    products: SaleProductRequest[];
}