export type PromotionType = "PRODUCT" | "COMBO" | "ORDER"

export type DiscountType = "PERCENT" | "FIXED"

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

// ── PRODUCT: each product has its own discount ────────────────────────────────

export interface ProductDiscountItem {
    productId: string
    discountValue: number,
    discountType: DiscountType
}

export interface ProductPromotion extends BasePromotion {
    promotionType: "PRODUCT",
    productDiscounts: ProductDiscountItem[]
}

// ── COMBO: buy N products, pay a fixed combo price ────────────────────────────

export interface ComboItem {
    productId: string;
    quantity: number;
}

export interface ComboDeal {
    comboId?: string;           // if editing existing combo
    name?: string;              // e.g. "1 áo + 1 váy"
    items: ComboItem[];         // products + quantities in the combo
    comboPrice: number;         // the fixed bundled price
}

export interface ComboPromotion extends BasePromotion {
    promotionType: "COMBO"
    combos: ComboDeal[];
}

// ── ORDER: tiered discount based on order total ───────────────────────────────

export interface PromotionLevel {
    minValue: number;
    discountType: DiscountType;
    discountValue: number;
    maxDiscount?: number;
}

export interface OrderPromotion extends BasePromotion {
    promotionType: "ORDER"
    levels: PromotionLevel[]
}

// ───────────────────────────────────────────────────────────────────────────────

export type Promotion = ProductPromotion | ComboPromotion | OrderPromotion