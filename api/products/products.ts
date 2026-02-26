import { CreateProduct } from "@/types/product";
import { axiosClient } from "../axiosClient";

// Nhân viên tạo sản phẩm mới 
export async function CreateProductAsync(productData: CreateProduct) {
    const response = await axiosClient.post(
        "/product/create",
        productData,
        { withCredentials: true }
    );

    return response.data;
};

// Lấy các sản phẩm có trạng thái pending của nhân viên đó
export async function GetPendingProducts() {
    const response = await axiosClient.get(
        "/product/pending",
        { withCredentials: true }
    );

    return response.data;
}