"use server";

import { changePassword, login } from "@/api/authentication/auth";
import { cookies } from "next/headers";

export async function loginAction(email: string, password: string) {
    const response = await login(email, password);

    (await cookies()).set("accessToken", response.accessToken)

    return response;
}

export async function logoutAction() {
    (await cookies()).delete("accessToken");
}

export async function changePasswordAction(userId: string, newPassword: string) {
    const response = await changePassword(userId, newPassword);

    (await cookies()).set("accessToken", response.accessToken)

    return response;
}