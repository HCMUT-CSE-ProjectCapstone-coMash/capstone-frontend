import { profile } from "@/api/authentication/auth";
import { clearUser, setUser } from "@/utilities/userStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PageLoading } from "@/components/PageLoading";

export function UserProvider({ children } : { children : React.ReactNode }) {
    const dispatch = useDispatch();

    const { isLoading, isError, data } = useQuery({
        queryKey: ["profile"],
        queryFn: profile,
        retry: false,
    });

    useEffect(() => {
        if (data) {
            dispatch(setUser(data));
        }

        if (isError) {
            dispatch(clearUser());
        }

    }, [data, isError, dispatch]);

    if (isLoading) return <PageLoading/>;

    return <>{children}</>
}