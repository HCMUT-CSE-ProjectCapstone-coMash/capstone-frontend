import axios from "axios";

export const axiosClient = axios.create({
    baseURL: "http://localhost:5194",
    headers: {
        "Content-Type": "application/json",
    }
});