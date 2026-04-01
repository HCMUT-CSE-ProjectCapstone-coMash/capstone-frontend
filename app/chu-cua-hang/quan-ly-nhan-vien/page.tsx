import Link from "next/link";
import { EmployeeSearch } from "@/components/SearchBar/EmployeeSearch";
import { EmployeeTable } from "@/components/Tables/EmployeeTable";
import { OwnerEmployeeManagementPageRoute } from "@/const/routes";

export default function EmployeeManagement() {
    return (
        <main className="px-20 py-5">
            <div className="text-purple text-3xl font-medium">Danh sách nhân viên</div>
            <div className="my-10.25 flex flex-column gap-10 justify-end">
                <EmployeeSearch/>
                <Link
                    href={`${OwnerEmployeeManagementPageRoute}/them-nhan-vien`}
                    className="py-2 px-3 rounded-lg text-white font-semibold bg-purple text-sm cursor-pointer inline-block text-center"
                >
                    Thêm nhân viên mới
                </Link>
            </div>
            <EmployeeTable/>
        </main>
    );
}