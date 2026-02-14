import { axiosClient } from "../axiosClient";

export async function login(email: string, password: string) {
    const response = await axiosClient.post(
        "/auth/login", 
        { email, password }, 
        { withCredentials: true }
    );

    return response.data;
}

export async function profile() {
    const response = await axiosClient.get(
        "/auth/profile",
        { withCredentials: true }
    );

    return response.data;
}

export async function logout() {
    const response = await axiosClient.post(
        "/auth/logout",
        {},
        { withCredentials: true }
    );

    return response.data;
}