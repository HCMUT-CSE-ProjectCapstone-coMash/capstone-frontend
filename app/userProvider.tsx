import { profile } from "@/api/authentication/auth";
import { setUser } from "@/utilities/userStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PageLoading } from "@/components/PageLoading";

export function UserProvider({ children } : { children : React.ReactNode }) {
    const dispatch = useDispatch();

    const { isLoading, data } = useQuery({
        queryKey: ["profile"],
        queryFn: profile,
        retry: false,
    });

    useEffect(() => {
        if (data) {
            dispatch(setUser(data));
        }
    }, [data, dispatch]);

    if (isLoading) return <PageLoading/>;

    return <>{children}</>
}