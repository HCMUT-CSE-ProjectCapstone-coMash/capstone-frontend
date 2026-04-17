"use client";

import Link from "next/link";
import { use } from "react";
import { OwnerEmployeeManagementPageRoute } from "@/const/routes";
import { DetailEmployeeByIdForm } from "@/components/Forms/DetailEmployeeByIdForm";

export default function EmployeeDetailPage({ params }: { params: Promise<{ employeeId: string }> }) {
    const { employeeId } = use(params);

    return (
        <main className="px-20 py-5">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Nhân viên</div>
                <Link
                    href={`${OwnerEmployeeManagementPageRoute}`}
                    className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                >
                    Danh sách nhân viên
                </Link>
            </div>
            <DetailEmployeeByIdForm employeeId={employeeId} />
        </main>
    );
}