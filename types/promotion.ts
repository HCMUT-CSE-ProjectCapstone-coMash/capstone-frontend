export type PromotionType = "Product" | "Combo" | "Order"

export type DiscountType = "Percent" | "Fixed"

// ── Shared fields across all promotion types ──────────────────────────────────

interface BasePromotion {
    id: string
    promotionId: string
    promotionName: string
    startDate: string
    endDate: string
    isActive: boolean
    createdAt: string
    description: string
}

// ── Product: each product has its own discount ────────────────────────────────

export interface ProductDiscountItem {
    productId: string
    discountValue: number,
    discountType: DiscountType
}

export interface ProductPromotion extends BasePromotion {
    promotionType: "Product",
    productDiscounts: ProductDiscountItem[]
}

// ── Combo: buy N products, pay a fixed combo price ────────────────────────────

export interface ComboItem {
    productId: string;
    quantity: number;
}

export interface ComboDeal {
    comboId?: string;           // if editing existing combo
    name: string;               // e.g. "1 áo + 1 váy"
    items: ComboItem[];         // products + quantities in the combo
    comboPrice: number;         // the fixed bundled price
}

export interface ComboPromotion extends BasePromotion {
    promotionType: "Combo"
    combos: ComboDeal[];
}

// ── Order: tiered discount based on order total ───────────────────────────────

export interface PromotionLevel {
    minValue: number;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount?: number;
}

export interface OrderPromotion extends BasePromotion {
    promotionType: "Order"
    levels: PromotionLevel[]
}

// ───────────────────────────────────────────────────────────────────────────────

export type Promotion = ProductPromotion | ComboPromotion | OrderPromotion

export type CreatePromotionPayload =
    | Omit<ProductPromotion, "id" | "promotionId" | "isActive" | "createdAt">
    | Omit<ComboPromotion, "id" | "promotionId" | "isActive" | "createdAt">
    | Omit<OrderPromotion, "id" | "promotionId" | "isActive" | "createdAt">;