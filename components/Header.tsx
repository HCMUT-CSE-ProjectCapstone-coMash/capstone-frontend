import { Navbar } from "./Navbar/Navbar";
import { Profile } from "./Profile";
import Link from "next/link";
import { HomePageRoute } from "@/const/routes";
import { cookies } from "next/headers";
import { decrypt } from "@/utilities/session";

export async function Header() {
    const cookie = (await cookies()).get('accessToken')?.value;
    const session = await decrypt(cookie);

    return (
        <>
            {session ? (
                <header className="h-24 bg-gray-white p-6 flex items-center justify-between">
                    <Link href={HomePageRoute}>
                        <p className="font-display font-semibold text-3xl text-pink">
                            co<span className="text-purple">Mash</span>
                        </p>
                    </Link>

                    <Navbar/>

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