"use client";

import { Navbar } from "./Navbar/Navbar";
import { Profile } from "./Profile";
import Link from "next/link";
import { EmployeeHomePageRoute, LoginPageRoute, OwnerHomePageRoute } from "@/const/routes";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";

const roleHomeMap: Record<string, string> = {
    employee: EmployeeHomePageRoute,
    owner: OwnerHomePageRoute,
};

export function Header() {
    const user = useSelector((state: RootState) => state.user);
    const homeRoute = user.role ? (roleHomeMap[String(user.role)] ?? LoginPageRoute) : LoginPageRoute;

    console.log(user);

    return (
        <>
            {user.hasChangedPassword ? (
                <header className="min-h-20 bg-gwhite px-10 flex items-center justify-between">
                    <Link href={homeRoute}>
                        <p className="font-display font-semibold text-3xl text-pink">
                            co<span className="text-purple">Mash</span>
                        </p>
                    </Link>

                    <Navbar role={user.role ?? ""}/>

                    <div>
                        <Profile userName={user.fullName || ""}/>
                    </div>
                </header>
            ) : (
                <header className="h-20 flex items-center justify-center bg-gwhite">
                    <p className="font-display font-semibold text-3xl text-pink">
                        co<span className="text-purple">Mash</span>
                    </p>
                </header>
            )}
        </>
    )
}