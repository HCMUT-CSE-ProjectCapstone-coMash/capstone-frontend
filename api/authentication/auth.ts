import { axiosClient } from "../axiosClient";

// Đăng nhập người dùng
export async function login(email: string, password: string) {
    const response = await axiosClient.post(
        "/auth/login", 
        { email, password }, 
        { withCredentials: true }
    );

    return response.data;
}

// Lấy thông tin người dùng hiện tại
export async function profile() {
    const response = await axiosClient.get(
        "/auth/profile",
        { withCredentials: true }
    );

    return response.data;
}

// Đăng xuất người dùng
export async function logout() {
    const response = await axiosClient.post(
        "/auth/logout",
        {},
        { withCredentials: true }
    );

    return response.data;
}

// Đổi mật khẩu
export async function changePassword(newPassword: string) {
    const response = await axiosClient.post(
        "/auth/change-password",
        { newPassword },
        { withCredentials: true }
    );

    return response.data;
}

// Đặt lại mật khẩu
export async function resetPassword(userId: string) {
    const response = await axiosClient.post(
        `/auth/reset-password/${userId}`,
        {},
        { withCredentials: true }
    );

    return response.data;
}