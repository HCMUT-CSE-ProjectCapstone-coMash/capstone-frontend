export interface ProductQuantity {
    size: string;
    quantities: number
}

export interface ProductQuantityChange {
    size: string;
    oldQuantity: number;
    newQuantity: number;
}

export interface CreateProduct {
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "Letter" | "Number",
    quantities: ProductQuantity[],
    createdBy: string,
    image: File | null,
    importPrice?: number,
    salePrice?: number,
}

export interface Product {
    id: string,
    productId: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "Letter" | "Number",
    quantities: ProductQuantity[],
    createdBy: string,
    createdAt: string,
    status: "Pending" | "Approved",
    imageURL: string
    quantityChanges?: ProductQuantityChange[],
    importPrice: number,
    salePrice: number,
}

export interface UpdateProduct {
    productId?: string,
    productName?: string,
    category?: string,
    color?: string,
    pattern?: string,
    sizeType?: "Letter" | "Number",
    quantities?: ProductQuantity[],
    image?: File | null,
    importPrice?: number,
    salePrice?: number,
}

export interface ProductWithOrderStatus {
    id: string,
    productId: string
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "Letter" | "Number",
    quantities: ProductQuantity[],
    createdBy: string,
    createdAt: string,
    status: "Pending" | "Approved",
    imageURL: string
    quantityChanges?: ProductQuantityChange[],
    importPrice: number,
    salePrice: number,
    isInPendingOrder: boolean
};

export interface TemporaryProduct {
    id: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    imageUrl: string,
}