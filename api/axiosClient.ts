import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "https://capstone-backend-production-037b.up.railway.app",
    headers: {
        "Content-Type": "application/json",
    }
});

// Tự động đính token vào mọi request
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});