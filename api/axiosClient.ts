import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "http://localhost:5194",
    // baseURL: "https://capstone-backend-production-037b.up.railway.app",
    headers: {
        "Content-Type": "application/json",
    }
});