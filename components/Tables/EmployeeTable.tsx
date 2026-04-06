"use client";

import { useRouter } from "next/navigation";
import { OwnerEmployeeManagementPageRoute } from "@/const/routes";

export type Employee = {
    id: string;
    name: string;
    dob: string;
    phone: string;
};

interface EmployeeTableProps {
    employees?: Employee[]; 
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
    const router = useRouter();

    const data: Employee[] = employees || [
        { id: "NV123", name: "Phó N Song Khuê", dob: "04/06/2004", phone: "0901234567" },
        { id: "NV124", name: "Đoàn Lê Vy", dob: "28/06/2004", phone: "0987654321" },
        { id: "NV125", name: "Huỳnh Ngọc Nhơn", dob: "13/06/2004", phone: "0912345678" },
    ];

    return (
        <div className="w-full">
            {/* --- Nút Thêm Nhân Viên --- */}
            <div className="flex justify-end mb-5">
                <button
                    onClick={() => router.push(`${OwnerEmployeeManagementPageRoute}/them-nhan-vien`)}
                    className="py-2 px-3 rounded-lg text-white font-semibold bg-purple text-sm cursor-pointer inline-block text-center hover:opacity-90 transition-opacity"
                >
                    Thêm nhân viên mới
                </button>
            </div>

            {/* --- Bảng Dữ Liệu --- */}
            <table className="w-full text-sm text-black">
                <thead>
                    <tr className="border-b border-tgray5">
                        <th className="pb-5 font-semibold text-center">Mã số nhân viên</th>
                        <th className="pb-5 font-semibold text-center">Tên nhân viên</th>
                        <th className="pb-5 font-semibold text-center">Ngày sinh</th>
                        <th className="pb-5 font-semibold text-center">Số điện thoại</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Nên dùng employee.id làm key thay vì index để React tối ưu render tốt hơn */}
                    {data.map((employee) => (
                        <tr key={employee.id} className="border-b border-tgray5 hover:bg-gray-50 transition-colors">
                            <td className="py-5 text-center">{employee.id}</td>
                            <td className="py-5 text-center">{employee.name}</td>
                            <td className="py-5 text-center">{employee.dob}</td>
                            <td className="py-5 text-center">{employee.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}