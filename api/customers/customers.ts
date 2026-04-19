import { axiosClient } from "../axiosClient";

export async function CreateCustomer(customerName: string, customerPhone: string, userId: string) {
    const response = await axiosClient.post(
        "/customers/create/" + userId,
        { 
            customerName: customerName,
            customerPhone: customerPhone
        },
        { withCredentials: true }
    );
    
    return response.data;
};

export async function FetchCustomerByName(customerName: string) {
    const response = await axiosClient.get("/customers/fetch-by-name", {
        params: { customerName },
        withCredentials: true
    });
    return response.data;
}

export async function FetchCustomerByPhone(customerPhone: string) {
    const response = await axiosClient.get("/customers/fetch-by-phone", {
        params: { customerPhone },
        withCredentials: true
    });
    return response.data;
}