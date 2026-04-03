"use client";

import { NavItem } from "@/types/UIType";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export function NavbarItem({ item } : { item : NavItem}) {
    const router = useRouter();
    const pathname = usePathname();
    const isPathActive = pathname === item.href || (item.matchNested && pathname.startsWith(`${item.href}/`));

    return (
        <button 
            className={`${isPathActive ? "text-black font-semibold" : "text-gray-500"} text-lg cursor-pointer`}
            onClick={() => { router.replace(item.href); router.refresh(); }}
        >
            {item.label}
        </button>
    )
}