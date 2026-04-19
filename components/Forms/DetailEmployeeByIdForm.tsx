"use client";

import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/utilities/store";
import { useState } from "react";
import { LayoutModal } from "../Modal/LayoutModal";
import { DeleteEmployeeModal } from "../Modal/DeleteEmployeeModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateEmployee } from "@/api/employees/employees";
import { setEmployee } from "@/utilities/employeeStore";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { useParams, useRouter } from "next/navigation";
import { OwnerEmployeeByIdPageRoute } from "@/const/routes";
import { Employee } from "@/types/employee";
import { useQuery } from "@tanstack/react-query";
import { FetchEmployees } from "@/api/employees/employees";

export function DetailEmployeeByIdForm() {
    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const employee = useSelector((state: RootState) => state.employee.selectedEmployee);
    const { employeeId } = useParams<{ employeeId: string }>();
    const router = useRouter();

    // State form khi edit — khởi tạo từ Redux
    const [formData, setFormData] = useState({
        fullName: employee?.fullName ?? "",
        gender: employee?.gender ?? "",
        dateOfBirth: employee?.dateOfBirth ?? "",
        phoneNumber: employee?.phoneNumber ?? "",
        email: employee?.email ?? "",
    });

    // Khi bắt đầu edit, sync formData từ Redux (đề phòng data đã load sau)
    const handleStartEdit = () => {
        setFormData({
            fullName: employee?.fullName ?? "",
            gender: employee?.gender ?? "",
            dateOfBirth: employee?.dateOfBirth ?? "",
            phoneNumber: employee?.phoneNumber ?? "",
            email: employee?.email ?? "",
        });
        setIsEditing(true);
    };

    // Mutation gọi API update
    const updateMutation = useMutation({
            mutationFn: () => UpdateEmployee(
        employee?.id ?? "", 
        {
            ...formData,
            id: "",           // thêm id
            employeeId: "", // thêm employeeId
            fullName: formData.fullName,
            gender: formData.gender,
            dateOfBirth: formData.dateOfBirth,
            phoneNumber: formData.phoneNumber,
            email: formData.email,
            imageFile: null,                  // không đổi ảnh thì để null
            imageURL:"",
        }
    ),
        onSuccess: () => {
            // Cập nhật Redux
            dispatch(setEmployee({ ...employee!, ...formData }));
            // Invalidate query để refetch danh sách
            queryClient.invalidateQueries({ queryKey: ["employee"] });
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật nhân viên thành công!" }));
            setIsEditing(false);
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật thất bại. Vui lòng thử lại!" }));
        },
    });

    const handleSave = () => {
        updateMutation.mutate();
    };
    const { data } = useQuery({
        queryKey: ["employees"],
        queryFn: () => FetchEmployees(1, 50),
    });

    const employees: Employee[] = data?.items ?? [];
    const currentIndex = employees.findIndex((e) => e.employeeId === employeeId);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < employees.length - 1;

    const handlePrev = () => {
        const prev = employees[currentIndex - 1];
        dispatch(setEmployee(prev));
        router.push(OwnerEmployeeByIdPageRoute(prev.employeeId));
    };

    const handleNext = () => {
        const next = employees[currentIndex + 1];
        dispatch(setEmployee(next));
        router.push(OwnerEmployeeByIdPageRoute(next.employeeId));
    };


    return (
        <div className="flex flex-column justify-between gap-[5vw]">
            {/* --- CỘT TRÁI: ẢNH --- */}
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

            {/* --- CỘT PHẢI: FORM --- */}
            <div className="w-2/3">
                {/* Nút hành động */}
                <div className="mb-5 flex justify-end gap-5">
                    {isEditing ? (
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                            className="border bg-pink text-white font-medium px-6 py-2 rounded-lg text-sm cursor-pointer hover:opacity-90 disabled:bg-gray-400 transition-all shadow-sm"
                        >
                            {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            className="border border-pink text-pink font-medium px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-pink-50 transition-all"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                    <button
                        type="button"
                        className="py-2 px-4 rounded-lg border border-red-500 bg-red-500 text-white text-sm font-medium hover:bg-red-600 cursor-pointer transition-all"
                        onClick={() => setConfirmModalOpen(true)}
                    >
                        Xoá nhân viên
                    </button>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-5">
                    <TextInput
                        disabled
                        label="Mã số nhân viên"
                        placeHolder=""
                        value={employee?.employeeId ?? ""}
                        onChange={() => {}}
                    />
                    <TextInput
                        disabled={!isEditing}
                        label="Tên nhân viên"
                        placeHolder="Nhập tên nhân viên"
                        value={isEditing ? formData.fullName : (employee?.fullName ?? "")}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
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
                                value={isEditing ? formData.gender : (employee?.gender ?? "")}
                                onChange={(value) => setFormData({ ...formData, gender: value })} 
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                disabled={!isEditing}
                                label="Ngày sinh"
                                placeHolder="DD/MM/YYYY"
                                value={isEditing ? formData.dateOfBirth : (employee?.dateOfBirth ?? "")}
                                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <div className="w-1/2">
                            <TextInput
                                disabled={!isEditing}
                                label="Số điện thoại"
                                placeHolder="Nhập số điện thoại"
                                value={isEditing ? formData.phoneNumber : (employee?.phoneNumber ?? "")}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                disabled={!isEditing}
                                label="Email"
                                placeHolder="Nhập email"
                                value={isEditing ? formData.email : (employee?.email ?? "")}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between mt-2.5 w-1/6 ml-auto">
                    <button
                        onClick={handlePrev}
                        disabled={!hasPrev}
                        className={`text-purple text-sm font-medium transition
                            ${hasPrev ? "hover:text-purple/70  cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                    >
                        ← Trước
                    </button>
                    <span className="text-sm text-gray-500">
                        {currentIndex + 1} / {employees.length}
                    </span>
                    <button
                        onClick={handleNext}
                        disabled={!hasNext}
                        className={`text-purple text-sm font-medium transition
                            ${hasNext ? "hover:text-purple/70 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
                    >
                        Sau →
                    </button>
                </div>
            </div>

            <LayoutModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
            >
                <DeleteEmployeeModal
                    employeeId={employee?.id ?? ""}
                    onClose={() => setConfirmModalOpen(false)}
                />
            </LayoutModal>
        </div>
    );
}