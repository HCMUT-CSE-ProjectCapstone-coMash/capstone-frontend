"use client";

import { useDispatch } from "react-redux";
import { PageLoading } from "@/components/PageLoading";
import { useQuery } from "@tanstack/react-query";
import { profile } from "@/api/authentication/auth";
import { setUser } from "@/utilities/userStore";
import { useEffect } from "react";

interface UserProviderProps {
    children: React.ReactNode;
    userId: string | null;
}

export function UserProvider({ children, userId } : UserProviderProps) {
    const dispatch = useDispatch();

    const { data, isLoading } = useQuery({
        queryKey: ["profile"],
        queryFn: profile,
        enabled: !!userId,
    });

    useEffect(() => {
        if (data) {
            dispatch(setUser(data));
        }
    }, [data, dispatch]);

    if (isLoading) return <PageLoading/>;

    return <>{children}</>
}