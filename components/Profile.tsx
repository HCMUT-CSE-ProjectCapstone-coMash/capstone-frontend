"use client";

import { Dropdown, MenuProps } from "antd";
import { LogoutIcon, UserIcon, ArrowDownLineIcon } from "@/public/assets/Icons";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { logout } from "@/api/authentication/auth";
import { clearUser } from "@/utilities/userStore";
import { LoginPageRoute } from "@/const/routes";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { clearEditingProduct } from "@/utilities/productEditStore";
import { clearProductsOrder } from "@/utilities/productsOrderStore";
import { clearOwnerEditingProduct } from "@/utilities/ownerProductEditStore";
import { clearSelectedIds } from "@/utilities/printStore";

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

            // Clear all editing states to prevent data leak between users
            dispatch(clearEditingProduct());
            dispatch(clearOwnerEditingProduct());
            dispatch(clearProductsOrder());
            dispatch(clearSelectedIds());

            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đăng xuất thành công" }));

            router.replace(LoginPageRoute);
            router.refresh();
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "" }));
        }
    });

    return (
        <div className="flex items-center gap-x-3">
            <LogoutIcon width={20} height={20} className={""}/>
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
                    <UserIcon width={24} height={24} className={""}/>
                    {userName}
                    <ArrowDownLineIcon width={24} height={24} className={""}/>
                </div>  
            </Dropdown>
        </div>
    )
}