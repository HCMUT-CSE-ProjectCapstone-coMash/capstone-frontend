import { Navbar } from "./Navbar/Navbar";
import { Profile } from "./Profile";
import Link from "next/link";
import { EmployeeHomePageRoute, LoginPageRoute, OwnerHomePageRoute } from "@/const/routes";
import { cookies } from "next/headers";
import { decrypt } from "@/utilities/session";

const roleHomeMap: Record<string, string> = {
    employee: EmployeeHomePageRoute,
    owner: OwnerHomePageRoute,
};

export async function Header() {
    const cookie = (await cookies()).get('accessToken')?.value;
    const session = await decrypt(cookie);

    const homeRoute = session?.role ? (roleHomeMap[String(session.role)] ?? LoginPageRoute) : LoginPageRoute;

    return (
        <>
            {session ? (
                <header className="h-24 bg-gray-white p-6 flex items-center justify-between">
                    <Link href={homeRoute}>
                        <p className="font-display font-semibold text-3xl text-pink">
                            co<span className="text-purple">Mash</span>
                        </p>
                    </Link>

                    <Navbar role={session.role}/>

                    <div>
                        <Profile userName={String(session.given_name) || ""}/>
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