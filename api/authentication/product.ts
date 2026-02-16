import { Product } from "@/types/product";
import { axiosClient } from "../axiosClient";


export async function CreateProduct(productData: Product) {

    const response = await axiosClient.post(
        "/product/create",
        productData,
        { withCredentials: true }
    );

    return response.data;
};