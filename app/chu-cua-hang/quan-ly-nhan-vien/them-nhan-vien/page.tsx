"use client";

import { EmployeeForm } from "@/components/Forms/EmployeeForm";
import { useRouter } from "next/navigation";

export default function EmployeeAdd() {
    const router = useRouter();
    
    return (
        <main className="px-20 pt-10 pb-25">
            <div className="flex justify-between items-center mb-12.5">
                <div className="text-purple text-3xl font-medium">Nhân viên</div>
                <button
                    onClick={() => router.back()}
                    className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                >
                    Danh sách nhân viên
                </button>
            </div>

            <EmployeeForm />
        </main>
    );
}