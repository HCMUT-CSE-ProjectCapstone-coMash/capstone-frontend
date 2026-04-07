export type PromotionType = "PRODUCT" | "COMBO" | "ORDER"

export type DiscountType = "PERCENT" | "FIXED"

export interface PromotionLevel {
    minValue: number
    discountValue: number
    discountType: DiscountType
    maxDiscount?: number
}

export interface CreateBasePromotion {
    promotionName: string
    startDate: string
    endDate: string
    description: string
    discountType: DiscountType  // applies to PRODUCT & COMBO
    discountValue: number       // applies to PRODUCT & COMBO
}

export interface CreateProductPromotion extends CreateBasePromotion {
    promotionType: "PRODUCT"
    productIds: string[]
}

export interface CreateComboPromotion extends CreateBasePromotion {
    promotionType: "COMBO"
    comboIds: string[]
}

export interface CreateOrderPromotion extends Omit<CreateBasePromotion, "discountType" | "discountValue"> {
    promotionType: "ORDER"
    levels: PromotionLevel[]
}

export type CreatePromotion =
    | CreateProductPromotion
    | CreateComboPromotion
    | CreateOrderPromotion

// Lấy từ backend

interface BasePromotion {
    id: string
    promotionId: string
    promotionName: string
    promotionType: PromotionType
    startDate: string
    endDate: string
    isActive: boolean
    createdAt: string
    description: string
    discountType?: DiscountType  // optional — not present for ORDER
    discountValue?: number       // optional — not present for ORDER
}

export interface ProductPromotion extends BasePromotion {
    productIds?: string[]
}

export interface ComboPromotion extends BasePromotion {
    comboIds?: string[]
}

export interface OrderPromotion extends BasePromotion {
    levels?: PromotionLevel[]
}

export type Promotion =
    | ProductPromotion
    | ComboPromotion
    | OrderPromotion