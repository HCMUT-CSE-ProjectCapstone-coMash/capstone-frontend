"use client";

import { useDispatch } from "react-redux";
import { PageLoading } from "@/components/PageLoading";
import { usePathname, useRouter } from "next/navigation";

export function UserProvider({ children } : { children : React.ReactNode }) {


    // if (isLoading) return <PageLoading/>;

    return <>{children}</>
}