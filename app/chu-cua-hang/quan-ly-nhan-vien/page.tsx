import { EmployeeTable } from "@/components/Tables/EmployeeTable";

export default function EmployeeManagement() {

    return (
        <main className="px-20 pt-10 pb-25">
            <div className="text-purple text-3xl font-medium">Danh sách nhân viên</div>
            
            <EmployeeTable />
        </main>
    );
}