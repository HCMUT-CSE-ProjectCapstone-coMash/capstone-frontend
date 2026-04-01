import { Product } from "./product";

export interface ProductsOrder {
    id: string,
    createdBy: string,
    createdByName: string,
    createdAt: string,
    orderName: string,
    orderDescription: string,
    orderStatus: "Pending" | "Approved" | "Sending",
    products: Product[]
} 

export interface UpdateProductsOrder {
    orderName?: string,
    orderDescription?: string,
    orderStatus?: "Pending" | "Approved" | "Sending",
}