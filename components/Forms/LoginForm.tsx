"use client"
import { useState } from "react"
import { TextInput } from "../FormInputs/TextInput"
import { useMutation } from "@tanstack/react-query";
import { login } from "@/api/authentication/auth";
import { AxiosError } from "axios";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { setUser } from "@/utilities/userStore";
import { User } from "@/types/user";
import { useRouter } from "next/navigation";
import { EmployeeHomePageRoute, LoginPageRoute, OwnerHomePageRoute } from "@/const/routes";

const roleHomeMap: Record<string, string> = {
    employee: EmployeeHomePageRoute,
    owner: OwnerHomePageRoute,
};

export function LoginForm() {
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const dispatch = useDispatch();
    const router = useRouter();

    // Đăng nhập
    const mutation = useMutation({
        mutationFn: () => login(userName, password),

        onSuccess: (data: User) => {
            dispatch(setUser(data));
            
            if (data.hasChangedPassword) {
                dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đăng nhập thành công" }));
    
                const homeRoute = roleHomeMap[data.role!] ?? LoginPageRoute;
                router.replace(homeRoute);
                router.refresh();
            } else {
                dispatch(addAlert({ type: AlertType.INFO, message: "Bạn cần đổi mật khẩu trước khi tiếp tục" }));
                router.replace("/doi-mat-khau");
            }
        },

        onError: (error: AxiosError<{ message: string }>) => {
            dispatch(addAlert({ type: AlertType.ERROR, message: error.response?.data.message }));
        }
    });

    // Xử lý submit form
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!userName) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng điền tên đăng nhập" }));
            return;
        }

        if (!password) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng điền mật khẩu" }));
            return;
        }

        mutation.mutate();
    }

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-purple font-semibold text-xl text-center mb-4">ĐĂNG NHẬP</h2>

            <div className="flex flex-col gap-y-5">
                <TextInput 
                    label={"Tên đăng nhập"} 
                    placeHolder={"Điền tên đăng nhập"}
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)}
                />

                <TextInput
                    label={"Mật khẩu"}
                    placeHolder={"Điền mật khẩu"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    inputType="password"
                />
            </div>

            <div className="flex justify-center mt-10">
                <button className={`
                    py-2 px-3 rounded-lg text-white bg-pink
                    ${mutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} 
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
            </div>
        </form>
    )
}