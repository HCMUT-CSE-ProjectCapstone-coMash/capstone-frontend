export interface ProductQuantity {
    size: string;
    quantity: number
}

export interface Product {
    productID: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "letter" | "number",
    quantities: ProductQuantity[]
}