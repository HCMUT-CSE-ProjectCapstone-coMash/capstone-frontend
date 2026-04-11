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
    customerMoney: number;
    products: SaleProductRequest[];
}