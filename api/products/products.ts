import { CreateProduct, UpdateProduct } from "@/types/product";
import { axiosClient } from "../axiosClient";
import { fileToBase64 } from "@/utilities/image";

// Nhân viên tạo sản phẩm mới 
export async function CreateProductAsync(productData: CreateProduct, productsOrderId: string) {
    const formData = new FormData();

    formData.append("ProductId", productData.productId);
    formData.append("ProductName", productData.productName);
    formData.append("Category", productData.category);
    formData.append("Color", productData.color);
    formData.append("Pattern", productData.pattern);
    formData.append("SizeType", productData.sizeType);
    formData.append("CreatedBy", productData.createdBy);

    productData.quantities.forEach((quantity, index) => {
        formData.append(`Quantities[${index}].Size`, quantity.size);
        formData.append(`Quantities[${index}].Quantities`, quantity.quantities.toString());
    })

    if (productData.image) {
        formData.append("Image", productData.image);
    }

    const response = await axiosClient.post(
        "/product/create/" + productsOrderId,
        formData,
        { 
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;
};

// Tìm kiếm sản phẩm tương tự bằng hình ảnh
export async function SearchSimilarProduct(imageFile: File) {
    const base64Image = await fileToBase64(imageFile);

    const response = await axiosClient.post(
        "/product/similar",
        { ImageBase64: base64Image },
        { withCredentials: true }
    );

    return response.data;
}

export async function AnalyzeImage(imageFile: File) {
    const base64Image = await fileToBase64(imageFile);

    const response = await axiosClient.post(
        "/product/analyze",
        { ImageBase64: base64Image },
        { withCredentials: true }
    );

    return response.data;
}

// Nhân viên cập nhật thông tin sản phẩm trong đơn hàng
export async function PatchProductInProductsOrder(productId: string, updateData: UpdateProduct) {
    const formData = new FormData();

    if (updateData.productId) formData.append("ProductId", updateData.productId);
    if (updateData.productName) formData.append("ProductName", updateData.productName);
    if (updateData.category) formData.append("Category", updateData.category);
    if (updateData.color) formData.append("Color", updateData.color);
    if (updateData.pattern) formData.append("Pattern", updateData.pattern);
    if (updateData.sizeType) formData.append("SizeType", updateData.sizeType);

    if (updateData.quantities) {
        updateData.quantities.forEach((quantity, index) => {
            formData.append(`Quantities[${index}].Size`, quantity.size);
            formData.append(`Quantities[${index}].Quantities`, quantity.quantities.toString());
        })
    }

    const response = await axiosClient.patch(
        "/product/patch/" + productId,
        updateData,
        { withCredentials: true }
    )

    return response.data;
}

export async function FetchProductByName(productName: string) {
    const response = await axiosClient.get(
        "/product/fetch-by-name/" + productName,
        { withCredentials : true }
    );

    return response.data;
}