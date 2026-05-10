"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { useMutation } from "@tanstack/react-query";
import { UpdateProductsOrder } from "@/types/productsOrder";
import { PatchOrderAndStatus } from "@/api/productsOrder/productsOrder";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { RootState } from "@/utilities/store";
import { clearProductsOrder } from "@/utilities/productsOrderStore";
import { CheckLineIcon } from "@/public/assets/Icons";
import { EmployeeBaseRoute } from "@/const/routes";
import { useRouter } from "next/navigation";

export function ProductsOrderForm() {
    const dispatch = useDispatch();
    const productsOrder = useSelector((state: RootState) => state.productsOrder.productsOrder);

    const [orderName, setOrderName] = useState<string>("");
    const [orderDescription, setOrderDescription] = useState<string>("");
    const [errors, setErrors] = useState({ orderName: false });

    const router = useRouter();
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    const patchMutation = useMutation({
        mutationFn: ({ orderId, updateData }: { orderId: string, updateData: UpdateProductsOrder }) => PatchOrderAndStatus(orderId, updateData),

        onSuccess: () => {
            setIsCompleted(true);
            dispatch(clearProductsOrder());
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Tạo đơn duyệt thành công"}));
        },

        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Tạo đơn duyệt thất bại" }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!productsOrder?.id) return;

        if (!orderName) {
            setErrors({ orderName: true });
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên danh sách" }))
            return;
        }

        const updateData: UpdateProductsOrder = {
            orderName: orderName,
            orderDescription: orderDescription,
            orderStatus: "Sending"
        };

        patchMutation.mutate({ orderId: productsOrder.id, updateData: updateData})
    }

    return (
        <div className="w-xl">
            {!isCompleted ? (
                <>
                    <p className="text-xl text-center font-medium">Tạo danh sách sản phẩm cần duyệt mới</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-5">
                        <TextInput
                            label={"Tên danh sách"}
                            value={orderName}
                            onChange={(e) => setOrderName(e.target.value)}
                            placeHolder={""}
                            isError={errors.orderName}
                        />

                        <TextInput
                            label={"Mô tả (Nếu có)"}
                            value={orderDescription}
                            onChange={(e) => setOrderDescription(e.target.value)}
                            placeHolder={""}
                            inputType="textarea"
                        />

                        <div className="flex justify-end">
                            <button className={`
                                py-2 px-3 rounded-lg text-white bg-pink text-sm
                                ${patchMutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} 
                                disabled={patchMutation.isPending}
                            >
                                {patchMutation.isPending ? "Đang gửi yều cầu" : "Gửi yêu cầu"}
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <div className="flex justify-center items-center flex-col gap-5 mt-5">
                    <div className="bg-light-pink p-2 rounded-full">
                        <CheckLineIcon width={52} height={52} className="text-white"/>
                    </div>

                    <p>Yêu cầu của bạn đã được gửi!</p>

                    <button 
                        className="py-2 px-3 rounded-lg text-white bg-pink text-sm mt-5 cursor-pointer"
                        onClick={() => router.replace(EmployeeBaseRoute)}
                    >
                        Về trang chủ
                    </button>
                </div>
            )}

        </div>
    )
}