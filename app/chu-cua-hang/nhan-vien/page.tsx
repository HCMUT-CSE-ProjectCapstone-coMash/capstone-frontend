import { EmployeeSearch } from "@/components/SearchBar/EmployeeSearch";
import { EmployeeTable } from "@/components/Tables/EmployeeTable";

export default function Employee() {
    return (
        <main className="px-20 py-5">
            <div className="text-purple text-3xl font-medium">Danh sách nhân viên</div>
            <div className="my-10.25 flex flex-column gap-10 justify-end">
                <EmployeeSearch/>
                <button
                            className={`py-2 px-3 rounded-lg text-white font-semibold bg-purple text-sm cursor-pointer`}
                        >
                            Thêm nhân viên mới
                </button>
            </div>
            <EmployeeTable/>
        </main>
    );
}