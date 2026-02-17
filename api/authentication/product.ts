import { CreateProduct } from "@/types/product";
import { axiosClient } from "../axiosClient";


export async function CreateProductAsync(productData: CreateProduct) {

    const response = await axiosClient.post(
        "/product/create",
        productData,
        { withCredentials: true }
    );

    return response.data;
};