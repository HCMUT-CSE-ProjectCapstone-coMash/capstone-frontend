
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

// -- Response types ----------------------------------------------------------------
export interface ProductPromotionResponse {
    id: string;
    discountType: string;
    discountValue: number;
    promotionId: string;
    promotionName: string;
}

export interface ComboPromotionResponse {
    id: string;
    comboName: string;
    comboPrice: number;
    comboItems: string[];
    promotionId: string;
}

export interface SaleOrderDetailResponse {
    id: string;
    productId: string;
    productName: string;
    imageUrl: string;
    selectedSize: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subTotal: number;
    profit: number;
    productPromotion: ProductPromotionResponse | null;
    comboPromotion: ComboPromotionResponse | null;
}

export interface SaleOrderResponse {
    id: string;
    saleOrderId: string;
    customerId: string | null;
    customerName: string | null;
    createdBy: string;
    createdByName: string;
    paymentMethod: string;
    debitMoney: number;
    createdAt: string;
    discount: number;
    totalPrice: number;
    totalProfit: number;
    details: SaleOrderDetailResponse[];
}

// -- Mapped types ----------------------------------------------------------------
export interface MappedComboPromotion {
    id: string;
    comboName: string;
    comboPrice: number;
    promotionId: string;
    items: SaleOrderDetailResponse[];
}

export interface MappedSaleOrder {
    id: string;
    saleOrderId: string;
    customerId: string | null;
    customerName: string | null;
    createdBy: string;
    createdByName: string;
    paymentMethod: string;
    debitMoney: number;
    createdAt: string;
    discount: number;
    totalPrice: number;
    totalProfit: number;
    products: SaleOrderDetailResponse[];
    combos: MappedComboPromotion[];
}

export function mapSaleOrder(response: SaleOrderResponse): MappedSaleOrder {
    const comboMap = new Map<string, MappedComboPromotion>();
    const standaloneProducts: SaleOrderDetailResponse[] = [];

    for (const detail of response.details) {
        if (detail.comboPromotion) {
            const comboId = detail.comboPromotion.id;

            if (!comboMap.has(comboId)) {
                comboMap.set(comboId, {
                    id: comboId,
                    comboName: detail.comboPromotion.comboName,
                    comboPrice: detail.comboPromotion.comboPrice,
                    promotionId: detail.comboPromotion.promotionId,
                    items: []
                });
            }

            comboMap.get(comboId)!.items.push(detail);
        } else {
            standaloneProducts.push(detail);
        }
    }

    return {
        ...response,
        products: standaloneProducts,
        combos: Array.from(comboMap.values())
    };
}