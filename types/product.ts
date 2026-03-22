export interface ProductQuantity {
    size: string;
    quantities: number
}

export interface CreateProduct {
    productId: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "Letter" | "Number",
    quantities: ProductQuantity[],
    createdBy: string,
    image: File | null
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
    status: "Pending" | "Approved" | "Sending",
    imageURL: string
}

export interface UpdateProduct {
    productId?: string,
    productName?: string,
    category?: string,
    color?: string,
    pattern?: string,
    sizeType?: "Letter" | "Number",
    quantities?: ProductQuantity[],
}