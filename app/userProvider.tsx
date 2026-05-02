import { profile } from "@/api/authentication/auth";
import { clearUser, setUser } from "@/utilities/userStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PageLoading } from "@/components/PageLoading";
import { User } from "@/types/user";

export function UserProvider({ children } : { children : React.ReactNode }) {
    const dispatch = useDispatch();

    // Kiểm tra xem người dùng đã đăng nhập hay chưa bằng cách gọi API profile
    const { isLoading, isError, data } = useQuery({
        queryKey: ["profile"],
        queryFn: profile,
        retry: false,
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (data) {
            const user: User = {
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                role: data.role,
                createdAt: data.createdAt,
                employeeId: data.employeeId,
                phoneNumber: data.phoneNumber,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth,
                imageURL: data.imageURL,
            }
            dispatch(setUser(user));
        }

        if (isError) {
            dispatch(clearUser());
        }

    }, [data, isError, dispatch]);

    if (isLoading) return <PageLoading/>;

    return <>{children}</>
}