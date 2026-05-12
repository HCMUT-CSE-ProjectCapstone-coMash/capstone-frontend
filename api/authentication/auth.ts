import { axiosClient } from "../axiosClient";

// Đăng nhập người dùng
export async function login(email: string, password: string) {
    const response = await axiosClient.post(
        "/auth/login", 
        { email, password },
    );

    return response.data;
}

// Lấy thông tin người dùng hiện tại
export async function profile() {
    const response = await axiosClient.get(
        "/auth/profile",
    );

    return response.data;
}

// Đổi mật khẩu
export async function changePassword(userId: string, newPassword: string) {
    const response = await axiosClient.post(
        "/auth/change-password/" + userId,
        { newPassword },
    );

    return response.data;
}

// Đặt lại mật khẩu
export async function resetPassword(userId: string) {
    const response = await axiosClient.post(
        `/auth/reset-password/${userId}`,
        {},
    );

    return response.data;
}