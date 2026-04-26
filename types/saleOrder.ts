
export interface SaleComboItemRequest {
    productId: string;
    selectedSize: string;
    quantity: number;
}

export interface SaleComboRequest {
    comboDealId: string;
    quantity: number;
    items: SaleComboItemRequest[];
}

export interface SaleProductRequest {
    productId: string;
    selectedSize: string;
    quantity: number;
    discount: number;
    promotionId: string;
}

export interface SaleOrderRequest {
    customerId: string;
    userId: string;
    paymentMethod: string;
    debtAmount: number;
    products: SaleProductRequest[];
    combos: SaleComboRequest[];
}