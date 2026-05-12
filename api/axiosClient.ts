import axios from "axios";

const baseURL = process.env.NODE_ENV === "production"
    ? "https://capstone-backend-production-037b.up.railway.app"
    : "http://localhost:5194";

export const axiosClient = axios.create({
    baseURL,
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