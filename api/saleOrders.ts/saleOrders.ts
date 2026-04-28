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

export async function FetchAllSaleOrders(currentPage: number, pageSize: number, timeRange?: string , search?: string) {
    const params = new URLSearchParams({
        currentPage: currentPage.toString(),
        pageSize: pageSize.toString(),
    });

    if (timeRange) params.append("timeRange", timeRange);
    if (search) params.append("search", search);

    const response = await axiosClient.get(
        `/sale-orders/fetch-all?${params.toString()}`,
        { withCredentials: true }
    );

    return response.data;
}

export async function FetchSaleOrdersById(saleOrderId: string) {
    const response = await axiosClient.get(
        `/sale-orders/${saleOrderId}`,
        { withCredentials: true }
    );
    return response.data;
}

export async function FetchCustomerSaleOrder(customerId: string) {
    const response = await axiosClient.get (
        `/sale-orders/fetch-all-by-customer/${customerId}`,
        { withCredentials: true }
    );
    return response.data;
}
