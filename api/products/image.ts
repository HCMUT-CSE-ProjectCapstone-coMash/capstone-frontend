import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:8000",
    headers: {
        "Content-Type": "multipart/form-data",
    }
});

// Dự đoán sản phẩm từ hình ảnh
export async function Predict(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post("/predict", formData)

    return response.data;
}