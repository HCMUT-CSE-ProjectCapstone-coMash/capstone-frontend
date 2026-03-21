import { Product } from "./product";

export interface ProductsOrder {
    id: string,
    createdBy: string,
    createdAt: string,
    orderName: string,
    orderDescription: string,
    orderStatus: "Pending" | "Approved" | "Sending",
    products: Product[]
} 