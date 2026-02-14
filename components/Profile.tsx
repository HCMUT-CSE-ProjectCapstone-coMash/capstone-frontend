"use client";

import { Dropdown, MenuProps } from "antd";
import { LogoutIcon, UserIcon, ArrowDownLine } from "@/public/assets/Icons";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/api/authentication/auth";
import { clearUser } from "@/utilities/userStore";
import { LoginPageRoute } from "@/const/routes";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

interface ProfileProps {
    userName: string
};

function LogoutOption() {
    const router = useRouter();
    const dispatch = useDispatch();

    const mutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            dispatch(clearUser());
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đăng xuất thành công" }));

            router.replace(LoginPageRoute);
        }
    });

    return (
        <div className="flex items-center gap-x-3">
            <LogoutIcon width={20} height={20} fill={""}/>
            <button className="cursor-pointer" onClick={() => mutation.mutate()}>
                Đăng xuất
            </button>
        </div>
    )
}

const items: MenuProps["items"] = [
    { key: "1", label: <LogoutOption/>}
]

export function Profile({ userName } : ProfileProps) {

    return (
        <div>
            <Dropdown menu={{ items }}>
                <div className="bg-pink text-white flex items-center justify-between gap-x-3 p-3 rounded-lg">
                    <UserIcon width={24} height={24} fill={"white"}/>
                    {userName}
                    <ArrowDownLine width={24} height={24} fill={"white"}/>
                </div>  
            </Dropdown>
        </div>
    )
}