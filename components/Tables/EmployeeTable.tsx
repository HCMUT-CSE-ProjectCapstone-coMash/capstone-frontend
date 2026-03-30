
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
    const data: Employee[] = employees || [
        { id: "NV123", name: "Phó N Song Khuê", dob: "04/06/2004", phone: "0901234567" },
        { id: "NV124", name: "Đoàn Lê Vy", dob: "28/06/2004", phone: "0987654321" },
        { id: "NV125", name: "Huỳnh Ngọc Nhơn", dob: "13/06/2004", phone: "0912345678" },
    ];

    return (
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
                {/* Khi mảng 'data' đã có kiểu dữ liệu, TypeScript sẽ tự hiểu 'employee' và 'index' là gì */}
                {data.map((employee, index) => (
                    <tr key={index} className="border-b border-tgray5">
                        <td className="py-5 text-center">{employee.id}</td>
                        <td className="py-5 text-center">{employee.name}</td>
                        <td className="py-5 text-center">{employee.dob}</td>
                        <td className="py-5 text-center">{employee.phone}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}