import { CreatePromotionPayload } from "@/types/promotion";
import { axiosClient } from "../axiosClient";

export async function FetchPromotionId() {
    const response = await axiosClient.get(
        "/promotions/create-promotion-id",
        { withCredentials: true}
    );

    return response.data;
};

export async function CreatePromotion(payload: CreatePromotionPayload) {
    const response = await axiosClient.post(
        "/promotions/create",
        payload,
        { withCredentials: true }
    );

    return response.data;
};