import { SaleOrderRequest } from "@/types/saleOrder";
import { axiosClient } from "../axiosClient";

export async function CreateSaleOrder(saleOrder: SaleOrderRequest) {
    const response = await axiosClient.post(
        "/sale-orders/create", 
        saleOrder,
        { withCredentials: true }
    );

    return response.data;
}