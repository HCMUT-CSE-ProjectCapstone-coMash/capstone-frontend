import axios from "axios";

export const axiosClient = axios.create({
    // baseURL: "http://localhost:5194",
    baseURL: "https://capstone-backend-production-037b.up.railway.app",
    headers: {
        "Content-Type": "application/json",
    }
});

axiosClient.interceptors.request.use((config) => {
    if (typeof window === "undefined") return config;

    const match = document.cookie.match(new RegExp(`(^| )accessToken=([^;]+)`));
    const token = match ? match[2] : null;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});