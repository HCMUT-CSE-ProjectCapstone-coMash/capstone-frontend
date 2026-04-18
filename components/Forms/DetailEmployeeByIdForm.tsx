"use client";

import { useQuery } from "@tanstack/react-query";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import Image from "next/image";
import { FetchEmployees} from "@/api/employees/employees";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
// Import action từ employeeStore bạn đã tạo ở bước trước
import { setSelectedEmployee } from "@/utilities/employeeStore"; 
import { EmployeeFormState } from "@/types/employee";

interface Props {
    employeeId: string;
}

export function DetailEmployeeByIdForm({ employeeId }: Props) {
    const dispatch = useDispatch();
    
    // 1. Lấy dữ liệu từ Store (Giống editProduct ở ví dụ của bạn)
    const employee = useSelector((state: RootState) => state.employee.selectedEmployee);

    // 2. Fetch dữ liệu từ API
    const { data, isLoading } = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: () => FetchEmployees(1, 50),
        enabled: !!employeeId,
    });

    useEffect(() => {
        // Kiểm tra nếu data có danh sách items
        if (data?.items) {
            // Tìm nhân viên có employeeId khớp với ID từ Props
            const foundEmployee = data.items.find((item: EmployeeFormState) => item.employeeId === employeeId);

            if (foundEmployee) {
                const formattedEmployee: EmployeeFormState = {
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

        // Cleanup: Xóa dữ liệu khi thoát khỏi trang để tránh "nháy" dữ liệu cũ
        return () => {
            dispatch(setSelectedEmployee(null));
        };
    }, [data, employeeId, dispatch]);

    // 4. Xử lý trạng thái Loading
    // Lưu ý: Nếu Store đã có data (chuyển từ trang danh sách sang) thì không cần hiện Loading xoay vòng
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
                        <div className="h-75 w-75 bg-tgray05 flex items-center justify-center rounded-lg border border-dashed border-gray-300">
                            <p className="text-sm text-gray-400">Không có ảnh</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG TIN FORM --- */}
            <div className="w-2/3">
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