import { CreateProduct } from "@/types/product";
import { axiosClient } from "../axiosClient";
import { fileToBase64 } from "@/utilities/image";

// Nhân viên tạo sản phẩm mới 
export async function CreateProductAsync(productData: CreateProduct) {
    const formData = new FormData();

    formData.append("ProductID", productData.productID);
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
        "/product/create",
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

// Lấy các sản phẩm có trạng thái pending của nhân viên đó
export async function GetPendingProducts() {
    const response = await axiosClient.get(
        "/product/pending",
        { withCredentials: true }
    );

    return response.data;
}

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