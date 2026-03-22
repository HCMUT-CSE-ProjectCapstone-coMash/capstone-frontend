import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { EmployeeBaseRoute, EmployeeHomePageRoute, LoginPageRoute, OwnerBaseRoute, OwnerHomePageRoute } from "./const/routes";
import { decrypt } from "./utilities/session";

const publicRoutes = [LoginPageRoute];

const roleHomeMap: Record<string, string> = {
    employee: EmployeeHomePageRoute,
    owner: OwnerHomePageRoute,
};

const roleBaseMap: Record<string, string> = {
    employee: EmployeeBaseRoute,
    owner: OwnerBaseRoute,
};

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isPublicRoute = publicRoutes.includes(path);
    const isProtectedRoute = Object.values(roleBaseMap).some(base => path.startsWith(base));

    const cookie = (await cookies()).get('accessToken')?.value;
    const session = await decrypt(cookie);
    const role = session?.role;

    // Not logged in, trying to access protected route
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL(LoginPageRoute, request.nextUrl));
    }

    // Logged in, trying to access login page
    if (isPublicRoute && session && role) {
        const home = roleHomeMap[role] ?? LoginPageRoute;
        return NextResponse.redirect(new URL(home, request.nextUrl));
    }

    // Logged in, but accessing wrong role's route
    if (isProtectedRoute && session && role) {
        const allowedBase = roleBaseMap[role];
        if (allowedBase && !path.startsWith(allowedBase)) {
            const home = roleHomeMap[role] ?? LoginPageRoute;
            return NextResponse.redirect(new URL(home, request.nextUrl));
        }
    }

    return NextResponse.next();
}