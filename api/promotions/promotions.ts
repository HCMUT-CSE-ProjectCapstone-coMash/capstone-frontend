import { axiosClient } from "../axiosClient";

export async function FetchPromotionId() {
    const response = await axiosClient.get(
        "/promotions/create-promotion-id",
        { withCredentials: true}
    );

    return response.data;
}