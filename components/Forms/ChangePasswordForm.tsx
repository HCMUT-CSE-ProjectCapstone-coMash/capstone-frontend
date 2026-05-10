"use client"

import { useState } from "react"
import { TextInput } from "../FormInputs/TextInput"
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/api/authentication/auth";
import { AxiosError } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { useRouter } from "next/navigation";
import { EmployeeHomePageRoute, OwnerHomePageRoute } from "@/const/routes";
import { RootState } from "@/utilities/store";
import { setUser } from "@/utilities/userStore";

const roleHomeMap: Record<string, string> = {
    employee: EmployeeHomePageRoute,
    owner: OwnerHomePageRoute,
};

export function ChangePasswordForm() {
    const [newPassword, setNewPassword] = useState<string>("");
    const [retypePassword, setRetypePassword] = useState<string>("");
    const dispatch = useDispatch();
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    
    const mutation = useMutation({
        mutationFn: () => changePassword(newPassword),

        onSuccess: () => {
            dispatch(setUser({ ...user, hasChangedPassword: true }));

            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đổi mật khẩu thành công"}));

            const homeRoute = roleHomeMap[user.role!];

            router.push(homeRoute);
        },

        onError: (error: AxiosError<{ message: string }>) => {
            dispatch(addAlert({ type: AlertType.ERROR, message: error.response?.data.message || "Đổi mật khẩu thất bại" }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng điền mật khẩu mới" }));
            return;
        }

        if (!retypePassword) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập lại mật khẩu mới" }));
            return;
        }

        if (newPassword !== retypePassword) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Mật khẩu nhập lại không khớp" }));
            return;
        }

        mutation.mutate();
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-purple font-semibold text-xl text-center mb-4">ĐỔI MẬT KHẨU</h2>

            <div className="flex flex-col gap-y-5">
                <TextInput
                    label={"Mật khẩu mới"}
                    placeHolder={"Điền mật khẩu mới"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    inputType="password"
                />

                <TextInput
                    label={"Nhập lại mật khẩu mới"}
                    placeHolder={"Nhập lại mật khẩu mới"}
                    value={retypePassword}
                    onChange={(e) => setRetypePassword(e.target.value)}
                    inputType="password"
                />
            </div>

            <div className="flex justify-center mt-10">
                <button className={`
                    py-2 px-3 rounded-lg text-white bg-pink
                    ${mutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </button>
            </div>
        </form>
    )
}