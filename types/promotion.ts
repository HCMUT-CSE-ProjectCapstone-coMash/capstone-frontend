import { Product } from "./product";

export type PromotionType = "Product" | "Combo" | "Order";

export type DiscountType = "Percent" | "Fixed";

export type PromotionStatus = "Active" | "Deleted";

// ── Shared fields across all promotion types ──────────────────────────────────

interface BasePromotion {
    id: string
    promotionId: string
    promotionName: string
    description: string
    promotionStatus: PromotionStatus
    startDate: string
    endDate: string
    createdAt: string
}

// ── Product: each product has its own discount ────────────────────────────────

export interface ProductDiscountItem {
    product: Product,
    discountType: DiscountType
    discountValue: number,
}

export interface ProductPromotion extends BasePromotion {
    promotionType: "Product",
    productDiscounts: ProductDiscountItem[]
}

// ── Combo: buy N products, pay a fixed combo price ────────────────────────────

export interface ComboItem {
    product: Product;
    quantity: number;
}

export interface ComboDeal {
    comboName: string;  
    comboPrice: number; 
    comboItems: ComboItem[];
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
    maxDiscount: number;
}

export interface OrderPromotion extends BasePromotion {
    promotionType: "Order"
    levels: PromotionLevel[]
}

// ───────────────────────────────────────────────────────────────────────────────

export type Promotion = ProductPromotion | ComboPromotion | OrderPromotion

// ── Create payload DTOs (sent to backend — product references are IDs only) ───
 
export interface ProductDiscountItemDto {
    productId: string;
    discountType: DiscountType;
    discountValue: number;
}
 
export interface ComboItemDto {
    productId: string;
    quantity: number;
}
 
export interface ComboDealDto {
    comboName: string;
    comboPrice: number;
    comboItems: ComboItemDto[];
}
 
interface BaseCreatePromotionPayload {
    promotionName: string;
    description: string;
    startDate: string;
    endDate: string;
}
 
export interface CreateProductPromotionPayload extends BaseCreatePromotionPayload {
    promotionType: "Product";
    productDiscounts: ProductDiscountItemDto[];
}
 
export interface CreateComboPromotionPayload extends BaseCreatePromotionPayload {
    promotionType: "Combo";
    combos: ComboDealDto[];
}
 
export interface CreateOrderPromotionPayload extends BaseCreatePromotionPayload {
    promotionType: "Order";
    levels: PromotionLevel[];
}
 
export type CreatePromotionPayload =
    | CreateProductPromotionPayload
    | CreateComboPromotionPayload
    | CreateOrderPromotionPayload;