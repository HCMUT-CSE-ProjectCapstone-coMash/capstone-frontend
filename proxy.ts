import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { HomePageRoute, ImportPageRoute, LoginPageRoute, OrderPageRoute, ProductPageRoute, SalePageRoute, SellPageRoute } from "./const/routes";
import { decrypt } from "./utilities/session";

const protectedRoutes = [HomePageRoute, ProductPageRoute, ImportPageRoute, SellPageRoute, SalePageRoute, OrderPageRoute];
const publicRoutes = [LoginPageRoute];

export default async function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.includes(path);
    const isPublicRoute = publicRoutes.includes(path);

    const cookie = (await cookies()).get('accessToken')?.value;
    const session = await decrypt(cookie);

    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL(LoginPageRoute, request.nextUrl));
    }

    if (isPublicRoute && session) {
        return NextResponse.redirect(new URL(HomePageRoute, request.nextUrl));
    }

    return NextResponse.next();
}