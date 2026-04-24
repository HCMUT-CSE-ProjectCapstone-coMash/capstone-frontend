import { Product } from "./product";
import { ComboDeal, ComboItem, ComboPromotion, DiscountType, ProductPromotion } from "./promotion";

// -- Promotion API response types ----------------------------------------------------------------

export interface ProductDiscountItemResponse {
    id: string;
    product: Product;
    discountType: DiscountType;
    discountValue: number;
}

export interface ProductPromotionResponse extends Omit<ProductPromotion, "productDiscounts"> {
    productDiscounts: ProductDiscountItemResponse[];
}

export interface ComboDealResponse extends Omit<ComboDeal, "comboItems"> {
    id: string;
    comboItems: ComboItem[];
}

export interface ComboPromotionResponse extends Omit<ComboPromotion, "combos"> {
    combos: ComboDealResponse[];
}

export interface PromotionsResponse {
    productPromotions: ProductPromotionResponse[];
    comboPromotions: ComboPromotionResponse[];
}

// -- Cart types --------------------------------------------------------------------------------

export interface AppliedProductDiscount {
    id: string;
    discountType: DiscountType;
    discountValue: number;
}

export interface ProductCartLine {
    kind: "product";
    product: Product;
    selectedSize: string,
    quantity: number;
    discount: number;
    appliedPromotion?: AppliedProductDiscount;
    availableCombos: ComboDealResponse[];
};

export interface ComboItemSlot {
    product: Product;
    selectedSize: string;
}

export interface ComboCartLine {
    kind: "combo";
    appliedCombo: ComboDealResponse;
    quantity: number;
    itemSlots: ComboItemSlot[];
};

export type CartLine = ProductCartLine | ComboCartLine;