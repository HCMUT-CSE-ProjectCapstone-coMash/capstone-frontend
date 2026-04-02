import { EmployeeForm } from "@/components/Forms/EmployeeForm";
export default function EmployeeAdd() {
    return (
        <main className="px-20 py-5">
            <div className="text-purple text-3xl font-medium">Nhân viên</div>
            <div className="flex flex-column justify-between">
                <div>Ảnh</div>
                <EmployeeForm/>
            </div>
        
        </main>
    );
}