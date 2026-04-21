import { CreatePromotionPayload } from "@/types/promotion";
import { axiosClient } from "../axiosClient";

export async function FetchPromotionId() {
    const response = await axiosClient.get(
        "/promotions/create-promotion-id",
        { withCredentials: true}
    );

    return response.data;
};

export async function CreatePromotion(payload: CreatePromotionPayload, userId: string) {
    const response = await axiosClient.post(
        "/promotions/create/" + userId,
        payload,
        { withCredentials: true }
    );

    return response.data;
};

export async function FetchPromotions(currentPage: number, pageSize: number, catergory?: string, search?: string) {
    const param = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
    });

    if (catergory) param.append("category", catergory);
    if (search) param.append("search", search);

    const response = await axiosClient.get(
        "/promotions/fetch-all?" + param.toString(),
        { withCredentials: true }
    );

    return response.data;
}

export async function FetchPromotionById(promotionId: string) {
    const response = await axiosClient.get(
        "/promotions/" + promotionId,
        { withCredentials: true }
    );

    return response.data;
}