export interface ProductQuantity {
    size: string;
    quantities: number
}

export interface ProductBase {
    productID: string,
    productName: string,
    category: string,
    color: string,
    pattern: string,
    sizeType: "Letter" | "Number",
    quantities: ProductQuantity[],
    createdBy: string,
}

export interface CreateProduct extends ProductBase {
    image: File | null
}

export interface Product extends ProductBase {
    id: string,
    createdAt: string,
    status: "Pending" | "Approved" | "Sending",
    imageURL: string
}