"use server";

import { login } from "@/api/authentication/auth";
import { cookies } from "next/headers";

export async function loginAction(email: string, password: string) {
    const response = await login(email, password);

    (await cookies()).set("accessToken", response.accessToken)

    return response;
}