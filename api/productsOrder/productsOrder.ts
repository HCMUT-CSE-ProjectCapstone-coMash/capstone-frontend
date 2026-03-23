import { axiosClient } from "../axiosClient";

// Nhân viên lấy đơn hàng hiện tại của mình, nếu chưa có thì tạo mới
export async function FetchOrCreateOrder(userId: string) {
    const response = await axiosClient.post(
        "products-orders/fetch/" + userId,
        {},
        { withCredentials: true }
    );
    return response.data;
}

export async function DeleteProductFromProductsOrders(orderId: string, productId: string) {
    const response = await axiosClient.delete(
        "products-orders/delete/" + orderId + "/" + productId,
        { withCredentials: true }
    );

    return response.data;
}