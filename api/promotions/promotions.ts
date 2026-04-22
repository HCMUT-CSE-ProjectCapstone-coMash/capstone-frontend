import { CreatePromotionPayload, UpdateComboPromotionPayload, UpdateOrderPromotionPayload, UpdateProductPromotionPayload } from "@/types/promotion";
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

export async function UpdateProductPromotion(promotionId: string, payload: UpdateProductPromotionPayload) {
    const response = await axiosClient.patch(
        "/promotions/product/" + promotionId,
        payload,
        { withCredentials: true }
    );

    return response.data;
}

export async function UpdateOrderPromotion(promotionId: string, payload: UpdateOrderPromotionPayload) {
    const response = await axiosClient.patch(
        "/promotions/order/" + promotionId,
        payload,
        { withCredentials: true }
    );

    return response.data;
    
}

export async function UpdateComboPromotion(promotionId: string, payload: UpdateComboPromotionPayload) {
    const response = await axiosClient.patch(
        "/promotions/combo/" + promotionId,
        payload,
        { withCredentials: true }
    );

    return response.data;
}