"use client";

import { NavItem } from "@/types/navbar";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function NavbarItem({ item } : { item : NavItem}) {
    const pathname = usePathname();
    const isPathActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

    return (
        <Link 
            className={`${isPathActive ? "text-black font-semibold" : "text-gray-500"} cursor-pointer`}
            href={item.href}
        >
            {item.label}
        </Link>
    )
}