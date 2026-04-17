"use client";

import Link from "next/link";
import { OwnerEmployeeManagementPageRoute } from "@/const/routes";

export default function EmployeeDetailPage() {

    return (
        <main className="px-20 py-10">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Nhân viên</div>
                <Link
                    href={`${OwnerEmployeeManagementPageRoute}`}
                    className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                >
                    Danh sách nhân viên
                </Link>
            </div>
        </main>
    )
}