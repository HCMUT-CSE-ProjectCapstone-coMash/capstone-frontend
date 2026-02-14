"use client";

import { useSelector } from "react-redux";
import { Navbar } from "./Navbar/Navbar";
import { Profile } from "./Profile";
import { RootState } from "@/utilities/store";
import Link from "next/link";
import { HomePageRoute } from "@/const/routes";

export function Header() {
    const user = useSelector((state: RootState) => state.user);

    return (
        <>
            {user.id ? (
                <header className="h-24 bg-gray-white p-6 flex items-center justify-between">
                    <Link href={HomePageRoute}>
                        <p className="font-display font-semibold text-3xl text-pink">
                            co<span className="text-purple">Mash</span>
                        </p>
                    </Link>

                    <Navbar/>

                    <div>
                        <Profile userName={user.fullName || ""}/>
                    </div>
                </header>
            ) : (
                <header className="h-24 flex items-center justify-center bg-gray-white">
                    <p className="font-display font-semibold text-3xl text-pink">
                        co<span className="text-purple">Mash</span>
                    </p>
                </header>
            )}
        </>
    )
}