import { profile } from "@/api/authentication/auth";
import { setUser } from "@/utilities/userStore";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { PageLoading } from "@/components/PageLoading";
import { User } from "@/types/user";
import { EmployeeBaseRoute, EmployeeHomePageRoute, LoginPageRoute, OwnerBaseRoute, OwnerHomePageRoute } from "@/const/routes";
import { usePathname, useRouter } from "next/navigation";

const roleHomeMap: Record<string, string> = {
    employee: EmployeeHomePageRoute,
    owner: OwnerHomePageRoute,
};

const roleBaseMap: Record<string, string> = {
    employee: EmployeeBaseRoute,
    owner: OwnerBaseRoute,
};

const publicRoutes = [LoginPageRoute];

export function UserProvider({ children } : { children : React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken && !publicRoutes.includes(pathname)) {
            router.replace(LoginPageRoute);
        }
    }, [pathname, router]);

    // Kiểm tra xem người dùng đã đăng nhập hay chưa bằng cách gọi API profile
    const { data, isLoading } = useQuery({
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
                hasChangedPassword: data.hasChangedPassword,
            }
            dispatch(setUser(user));

            const role = user.role ?? "";

            if (!data.hasChangedPassword) {
                if (pathname !== "/doi-mat-khau") {
                    router.replace("/doi-mat-khau");
                }
                return;
            }

            if (pathname === "/" || publicRoutes.includes(pathname)) {
                router.replace(roleHomeMap[role] ?? LoginPageRoute);
                return;
            }

            if (publicRoutes.includes(pathname)) {
                router.replace(roleHomeMap[role] ?? LoginPageRoute);
                return;
            }    

            const allowedBase = roleBaseMap[role];
            const isProtectedRoute = Object.values(roleBaseMap).some(base =>
                pathname.startsWith(base)
            );
            if (isProtectedRoute && allowedBase && !pathname.startsWith(allowedBase)) {
                router.replace(roleHomeMap[role] ?? LoginPageRoute);
            }
        }

    }, [data, dispatch, pathname, router]);

    if (isLoading) return <PageLoading/>;

    return <>{children}</>
}