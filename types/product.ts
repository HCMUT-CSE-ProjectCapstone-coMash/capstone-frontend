export interface ProductQuantity {
    size: string;
    quantities: number
}

export interface CreateProduct {
    productID: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "letter" | "number",
    quantities: ProductQuantity[],
    createdBy: string
}

export interface Product {
    id: string,
    productID: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "letter" | "number",
    quantities: ProductQuantity[],
    createdBy: string,
    createdAt: string,
    status: "pending" | "approved" | "sending"
}