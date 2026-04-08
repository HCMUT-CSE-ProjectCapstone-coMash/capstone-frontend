import { UpdateProductsOrder } from "@/types/productsOrder";
import { axiosClient } from "../axiosClient";

// Get a single products order by ID
export async function GetProductsOrderById(orderId: string) {
    const response = await axiosClient.get(
        `products-orders/${orderId}`,
        { withCredentials: true }
    );
    return response.data;
}

export const ApproveProductsOrder = async (orderId: string) => {
    const response = await axiosClient.patch(
        `/products-orders/approve/${orderId}`,
        {},
        { withCredentials: true }
    );
    return response.data;
};

export const DeleteProductsOrder = async (orderId: string) => {
    const response = await axiosClient.delete(
        `/products-orders/${orderId}`,
        { withCredentials: true }
    );
    return response.data;
};

// Nhân viên lấy đơn hàng hiện tại của mình, nếu chưa có thì tạo mới
export async function FetchOrCreateOrder(userId: string) {
    const response = await axiosClient.post(
        "products-orders/fetch/" + userId,
        {},
        { withCredentials: true }
    );
    return response.data;
}

export async function GetProductsOrdersExcludingPending() {
    const response = await axiosClient.get(
        "products-orders/fetch-excluding-pending", 
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

// Nhân viên gửi đơn hàng cho chủ cửa hàng duyệt
export async function PatchOrderAndStatus(orderId: string, updateData: UpdateProductsOrder) {
    const formData = new FormData();
    
    if (updateData.orderName) formData.append("OrderName", updateData.orderName);
    if (updateData.orderDescription) formData.append("OrderDescription", updateData.orderDescription);
    if (updateData.orderStatus) formData.append("OrderStatus", updateData.orderStatus);

    const response = await axiosClient.patch(
        "products-orders/patch/" + orderId,
        formData,
        { withCredentials: true }
    );
    
    return response.data;
}