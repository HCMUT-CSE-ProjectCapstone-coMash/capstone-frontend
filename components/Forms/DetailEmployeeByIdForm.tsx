"use client";

import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { OwnerEmployeeManagementPageRoute } from "@/const/routes";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import Image from "next/image";
import { DeleteEmployee, FetchEmployees} from "@/api/employees/employees";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
// Import action từ employeeStore bạn đã tạo ở bước trước
import { removeEmployee, setSelectedEmployee } from "@/utilities/employeeStore"; 
import { EmployeeFormState } from "@/types/employee";
import { AlertType } from "@/types/alert";
import { addAlert } from "@/utilities/alertStore";


export function DetailEmployeeByIdForm() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const dispatch = useDispatch();
    const router = useRouter(); // Khởi tạo router để quay lại danh sách sau khi xóa
    
    const employee = useSelector((state: RootState) => state.employee.selectedEmployee);

    // 1. Fetch dữ liệu nhân viên
    const { data, isLoading } = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: () => FetchEmployees(1, 50),
        enabled: !!employeeId,
    });

    useEffect(() => {
        if (data?.items) {
            const foundEmployee = data.items.find((item: { employeeId: string }) => item.employeeId === employeeId);
            if (foundEmployee) {
                const formattedEmployee: EmployeeFormState = {
                    id: foundEmployee.id,
                    employeeId: foundEmployee.employeeId,
                    fullName: foundEmployee.fullName,
                    gender: foundEmployee.gender,
                    dateOfBirth: foundEmployee.dateOfBirth,
                    phoneNumber: foundEmployee.phoneNumber,
                    email: foundEmployee.email,
                    imageFile: null, 
                    imageURL: foundEmployee.imageUrl || foundEmployee.imageURL || null, 
                };
                dispatch(setSelectedEmployee(formattedEmployee));
            }
        }
        return () => { dispatch(setSelectedEmployee(null)); };
    }, [data, employeeId, dispatch]);

    // 2. Định nghĩa Mutation để xóa nhân viên
    const deleteMutation = useMutation({
        mutationFn: ({ employeeId } : { employeeId: string }) => DeleteEmployee(employeeId),
        onSuccess: () => {
            // Cập nhật Store local
            dispatch(removeEmployee(employeeId));
            // Thông báo thành công
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xóa nhân viên thành công!" }));
            // Điều hướng về trang danh sách nhân viên
            router.push(OwnerEmployeeManagementPageRoute); // Thay đổi path này cho đúng với project của bạn
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Xóa nhân viên thất bại. Vui lòng thử lại!" }));
        }
    });

    // 3. Hàm xử lý khi nhấn nút xóa
    const handleDelete = () => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhân viên ${employee?.fullName}?`)) {
             deleteMutation.mutate({ employeeId: employee?.id ?? employeeId });
        }
    };

    if (isLoading && !employee) return <div className="p-5">Đang tải thông tin...</div>;
    return (
        <div className="flex flex-column justify-between gap-[5vw]">
            {/* --- CỘT TRÁI: ẢNH NHÂN VIÊN --- */}
            <div className="w-1/3">
                <p className="text-lg mb-2.5">Thông tin nhân viên</p>
                <div className="w-md">
                    {employee?.imageURL ? (
                        <div className="relative group h-75 w-75">
                            <Image
                                src={employee.imageURL}
                                alt="Employee Avatar"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="h-75 w-75 bg-tgray05 flex items-center justify-center rounded-lg border-gray-300">
                            <p className="text-sm text-gray-400">Không có ảnh</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG TIN FORM --- */}
            <div className="w-2/3">
                <div className="mb-5 flex justify-end gap-5">
                    <button
                        className="border border-pink text-pink font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-pink-50"
                    >
                        Chỉnh sửa
                    </button>
                    <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="border bg-red-500 text-white font-medium px-4 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-red-600 disabled:bg-gray-400"
                    >
                    {deleteMutation.isPending ? "Đang xóa..." : "Xóa nhân viên"}
                    </button>
                </div>
                <div className="flex flex-col gap-5">
                    <TextInput
                        disabled
                        label="Mã số nhân viên"
                        placeHolder=""
                        value={employee?.employeeId ?? ""}
                        onChange={() => {}}
                    />
                    <TextInput
                        disabled
                        label="Tên nhân viên"
                        placeHolder=""
                        value={employee?.fullName ?? ""}
                        onChange={() => {}}
                    />
                    
                    <div className="flex items-center justify-between gap-5">
                        <div className="w-1/2">
                            <SelectInput
                                label="Giới tính"
                                options={[
                                    { label: "Nữ", value: "Nữ" },
                                    { label: "Nam", value: "Nam" },
                                    { label: "Khác", value: "Khác" },
                                ]}
                                value={employee?.gender ?? ""}
                                onChange={() => {}}
                                disabled
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Ngày sinh"
                                placeHolder=""
                                value={employee?.dateOfBirth ?? ""}
                                onChange={() => {}}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Số điện thoại"
                                placeHolder=""
                                value={employee?.phoneNumber ?? ""}
                                onChange={() => {}}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                disabled
                                label="Email"
                                placeHolder=""
                                value={employee?.email ?? ""}
                                onChange={() => {}}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}