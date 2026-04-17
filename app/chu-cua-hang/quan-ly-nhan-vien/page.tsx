
import { EmployeeTable } from "@/components/Tables/EmployeeTable";

export default function EmployeeManagement() {
    return (
        <main className="px-20 py-5">
            <div className="text-purple text-3xl font-medium">Danh sách nhân viên</div>
            
            {/* Chỉ còn lại thanh tìm kiếm ở phía trên
            <div className="my-10 flex justify-end">
                <EmployeeSearch />
            </div> */}
            
            <EmployeeTable />
        </main>
    );
}