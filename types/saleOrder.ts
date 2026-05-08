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
        // 1. Aggregate quantities per product across all size variants
        const totalsByProduct = new Map<string, number>();
        for (const detail of combo.items) {
            totalsByProduct.set(
                detail.productId,
                (totalsByProduct.get(detail.productId) ?? 0) + detail.quantity
            );
        }
    
        // 2. For each member of the combo definition, compute how many
        //    full combos that product's total covers
        const comboMembers = combo.items[0]?.comboPromotion?.comboItems ?? [];
    
        const ratios = comboMembers.map((member) => {
            if (member.quantity <= 0) return 0;
            const total = totalsByProduct.get(member.productId) ?? 0;
            return Math.floor(total / member.quantity);
        });
    
        // 3. The combo count is limited by whichever member has the fewest
        combo.quantity = ratios.length > 0 ? Math.min(...ratios) : 0;
    }

    return {
        ...response,
        products: standaloneProducts,
        combos: Array.from(comboMap.values()),
        appliedOrderPromotion: response.appliedOrderPromotion ?? null,
    };
}

// -- Income stats types ----------------------------------------------------------------
export interface IncomeGroup { key: string; total: number; }
export interface IncomeStats { period: string; total: number; groups: IncomeGroup[]; }

// -- Top customer stats types ----------------------------------------------------------------
export interface TopCustomer { customerId: string, name: string, total: number }
export interface TopCustomerStats { customers: TopCustomer[], walkInTotal: number, grandTotal: number }