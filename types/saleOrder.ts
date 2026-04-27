// -- Request types ---------------------------------------------------------------
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
    orderPromotionId: string;
}

// -- Response types --------------------------------------------------------------
export interface ProductPromotionResponse {
    id: string;
    discountType: string;
    discountValue: number;
    promotionId: string;
    promotionName: string;
}

export interface ComboItemResponse {
    id: string;
    productId: string;
    product: unknown | null;
    quantity: number;
}

export interface ComboPromotionResponse {
    id: string;
    comboName: string;
    comboPrice: number;
    comboItems: ComboItemResponse[];
    promotionId: string;
}

export interface OrderPromotionResponse {
    id: string;
    minValue: number;
    discountType: string;
    discountValue: number;
    maxDiscount: number;
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
    customerPhone?: string | null;
    createdBy: string;
    createdByName: string;
    paymentMethod: string;
    debitMoney: number;
    createdAt: string;
    discount: number;
    totalPrice: number;
    totalProfit: number;
    originalTotalPrice: number;
    appliedOrderPromotionName: string | null;
    appliedOrderPromotion: OrderPromotionResponse | null;
    details: SaleOrderDetailResponse[];
}

// -- Mapped types ----------------------------------------------------------------
export interface MappedComboPromotion {
    id: string;
    comboName: string;
    comboPrice: number;
    quantity: number;          // how many times the combo is applied
    promotionId: string;
    items: SaleOrderDetailResponse[];
}

export interface MappedSaleOrder {
    id: string;
    saleOrderId: string;
    customerId: string | null;
    customerName: string | null;
    customerPhone?: string | null;
    createdBy: string;
    createdByName: string;
    paymentMethod: string;
    debitMoney: number;
    createdAt: string;
    discount: number;
    totalPrice: number;
    totalProfit: number;
    originalTotalPrice: number;
    appliedOrderPromotionName: string | null;
    appliedOrderPromotion: OrderPromotionResponse | null;
    products: SaleOrderDetailResponse[];
    combos: MappedComboPromotion[];
}

// -- Mapper ----------------------------------------------------------------------
export function mapSaleOrder(response: SaleOrderResponse): MappedSaleOrder {
    const comboMap = new Map<string, MappedComboPromotion>();
    const standaloneProducts: SaleOrderDetailResponse[] = [];

    // Group details: combo lines into comboMap, standalone products into a list.
    for (const detail of response.details) {
        if (detail.comboPromotion) {
            const comboId = detail.comboPromotion.id;

            if (!comboMap.has(comboId)) {
                comboMap.set(comboId, {
                    id: comboId,
                    comboName: detail.comboPromotion.comboName,
                    comboPrice: detail.comboPromotion.comboPrice,
                    promotionId: detail.comboPromotion.promotionId,
                    quantity: 0,           // computed below
                    items: [],
                });
            }

            comboMap.get(comboId)!.items.push(detail);
        } else {
            standaloneProducts.push(detail);
        }
    }

    for (const combo of comboMap.values()) {
        const ratios = combo.items.map((detail) => {
            const member = detail.comboPromotion!.comboItems.find(
                (ci) => ci.productId === detail.productId
            );
            if (!member || member.quantity <= 0) return detail.quantity;
            return Math.floor(detail.quantity / member.quantity);
        });
        combo.quantity = ratios.length > 0 ? Math.min(...ratios) : 0;
    }

    return {
        ...response,
        products: standaloneProducts,
        combos: Array.from(comboMap.values()),
        appliedOrderPromotion: response.appliedOrderPromotion ?? null,
    };
}