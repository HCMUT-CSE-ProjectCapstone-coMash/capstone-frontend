"use client";

import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { LayoutModal } from "../Modal/LayoutModal";
import { DeleteEmployeeModal } from "../Modal/DeleteEmployeeModal";
import { useMutation } from "@tanstack/react-query";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import { Employee, UpdateEmployeePayload } from "@/types/employee";
import { DatePickerInput } from "../FormInputs/DatePickerInput";
import { UpdateEmployee } from "@/api/employees/employees";
import { resetPassword } from "@/api/authentication/auth";

interface FormState {
    employeeId: string,
    fullName: string,
    gender: string,
    dateOfBirth: string,
    phoneNumber: string,
    email: string,
    imageUrl: string,
    imageFile: File | null,
}

function mapEmployeeToForm(employee: Employee): FormState {
    return {
        employeeId: employee.employeeId,
        fullName: employee.fullName,
        gender: employee.gender,
        dateOfBirth: employee.dateOfBirth,
        phoneNumber: employee.phoneNumber,
        email: employee.email,
        imageUrl: employee.imageURL ?? "",
        imageFile: null,
    };
}

interface DetailEmployeeByIdFormProps {
    employee: Employee;
}

export function DetailEmployeeByIdForm({ employee } : DetailEmployeeByIdFormProps) {
    const dispatch = useDispatch();

    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState<FormState>(() => mapEmployeeToForm(employee));
    const [initialForm, setInitialForm] = useState<FormState>(() => mapEmployeeToForm(employee));
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const isUnchanged = JSON.stringify(form) === JSON.stringify(initialForm);

    // Sử dụng useMemo để tạo URL preview từ file ảnh, và useEffect để giải phóng URL khi component unmount hoặc file thay đổi
    const objectUrl = useMemo(() => {
        if (!form.imageFile) return null;
        const url = URL.createObjectURL(form.imageFile);
        return url;
    }, [form.imageFile]);
    
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);
    
    const previewSrc = objectUrl ?? form.imageUrl ?? null;

    const updateMutation = useMutation({
        mutationFn: ({ employeeId, updatedData } : { employeeId: string, updatedData: UpdateEmployeePayload }) => UpdateEmployee(employeeId, updatedData),
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Cập nhật thông tin nhân viên thành công!" }));
            setInitialForm(form);
            setIsEditing(false);
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Cập nhật thông tin nhân viên thất bại. Vui lòng thử lại." }));
        }
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (userId: string) => resetPassword(userId),
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Đặt lại mật khẩu thành công!" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Đặt lại mật khẩu thất bại. Vui lòng thử lại." }));
        }
    });

    const handleSave = () => {
        const updatedData: UpdateEmployeePayload = {
            fullName: form.fullName,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            phoneNumber: form.phoneNumber,
            email: form.email,
        };

        updateMutation.mutate({ employeeId: employee.id, updatedData });
    }

    return (
        <div className="flex flex-column justify-between gap-[5vw]">
            {/* --- CỘT TRÁI: ẢNH --- */}
            <div className="w-1/3">
                <p className="text-lg mb-2.5">Thông tin nhân viên</p>
                <div className="w-md">
                    {employee?.imageURL ? (
                        <div className="relative group h-75 w-75">
                            <Image
                                src={previewSrc} 
                                placeholder="blur" 
                                blurDataURL={"/assets/image/light-pink.png"} 
                                alt="" fill className="object-cover" unoptimized
                            />
                        </div>
                    ) : (
                        <div className="h-75 w-75 bg-tgray05 flex items-center justify-center rounded-lg border-gray-500">
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
                        isUnchanged ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setForm(initialForm);
                                    setIsEditing(false);
                                }}
                                className="border border-gray-400 text-gray-600 font-medium px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-gray-100 transition-all"
                            >
                                Huỷ bỏ
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="border bg-pink text-white font-medium px-6 py-2 rounded-lg text-sm cursor-pointer hover:opacity-90 disabled:bg-gray-400 transition-all shadow-sm"
                            >
                                {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                            </button>
                        )
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="border border-pink text-pink font-medium px-3 py-2 rounded-lg text-sm cursor-pointer hover:bg-pink-50 transition-all"
                        >
                            Chỉnh sửa
                        </button>
                    )}
                    <button
                        type="button"
                        className="border border-purple text-purple font-medium px-3 py-2 rounded-lg text-sm cursor-pointer inline-block text-center hover:bg-purple-50"
                        onClick={() => resetPasswordMutation.mutate(employee.id)}
                        disabled={resetPasswordMutation.isPending}
                    >
                        {resetPasswordMutation.isPending ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                    </button>
                    <button
                        type="button"
                        className="py-2 px-4 rounded-lg border border-red bg-red text-white text-sm font-medium hover:bg-red-500 cursor-pointer transition-all"
                        onClick={() => setConfirmModalOpen(true)}
                    >
                        Xoá nhân viên
                    </button>
                </div>

                {/* Fields */}
                <div className="flex flex-col gap-5">
                    <TextInput
                        disabled={true}
                        label="Mã số nhân viên"
                        placeHolder=""
                        value={form.employeeId}
                        onChange={() => {}}
                    />

                    <TextInput
                        disabled={!isEditing}
                        label="Tên nhân viên"
                        placeHolder="Nhập tên nhân viên"
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)}
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
                                value={form.gender}
                                onChange={(value) => setField("gender", value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="w-1/2">
                            <DatePickerInput
                                label="Ngày sinh"
                                placeHolder=""
                                value={form.dateOfBirth}
                                onChange={(value) => setField("dateOfBirth", value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <div className="w-1/2">
                            <TextInput
                                label="Số điện thoại"
                                placeHolder="Nhập số điện thoại"
                                value={form.phoneNumber}
                                onChange={(e) => setField("phoneNumber", e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                                label="Email"
                                placeHolder="Nhập email"
                                value={form.email}
                                onChange={(e) => setField("email", e.target.value)}
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <LayoutModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
            >
                <DeleteEmployeeModal
                    employeeId={employee.id}
                    onClose={() => setConfirmModalOpen(false)}
                />
            </LayoutModal>
        </div>
    );
}