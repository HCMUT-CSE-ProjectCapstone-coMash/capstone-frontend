"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import Image from "next/image";
import { EmployeeFormState } from "@/types/employee";
import { CreateEmployeeAsync, GetNewEmployeeId } from "@/api/employees/employees";

const initialEmployeeFormState: EmployeeFormState = {
    employeeId: "",
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    imageURL: "",
    imageFile: null,
};

const genderOptions = [
    { label: "Nữ", value: "Nữ" },
    { label: "Nam", value: "Nam" },
    { label: "Khác", value: "Khác" }
];

export function EmployeeForm() {
    const [form, setForm] = useState<EmployeeFormState>(initialEmployeeFormState);
    const dispatch = useDispatch();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const setField = <K extends keyof EmployeeFormState>(key: K, value: EmployeeFormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const { data: idData} = useQuery({
        queryKey: ["new-employee-id"],
        queryFn: GetNewEmployeeId,
        staleTime: Infinity, // Chỉ lấy 1 lần duy nhất khi mở form
    });

    
    // --- Mutation xử lý gửi data lên Database ---
    const mutation = useMutation({
        mutationFn: (employeeData: EmployeeFormState) => CreateEmployeeAsync(employeeData),
        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm nhân viên thành công!" }));
        },
        onError: () => {
            dispatch(addAlert({ type: AlertType.ERROR, message: "Thêm nhân viên thất bại. Vui lòng thử lại." }));
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.fullName.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên nhân viên" }));
            return;
        }

        if (!form.gender.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập giới tính nhân viên" }));
            return;
        }

        if (!form.dateOfBirth.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập ngày sinh nhân viên" }));
            return;
        }

        if (!form.phoneNumber.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số điện thoại nhân viên" }));
            return;
        }

        if (!form.email.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập email nhân viên" }));
            return;
        }

        // Tạo FormData để đóng gói cả text và file ảnh
        const formData = new FormData();
        formData.append("FullName", form.fullName);
        formData.append("Gender", form.gender);
        formData.append("DateOfBirth", form.dateOfBirth);
        formData.append("PhoneNumber", form.phoneNumber);
        formData.append("Email", form.email);

        if (form.imageFile) {
            formData.append("Image", form.imageFile); // Tên field "Image" phải khớp với Backend
        }

        mutation.mutate({ ...form, employeeId: idData?.employeeId ?? "" });
        
    };

    const isFormComplete = 
        form.fullName.trim() !== "" &&
        form.gender.trim() !== "" &&
        form.dateOfBirth.trim() !== "" &&
        form.phoneNumber.trim() !== "" &&
        form.email.trim() !== "";

    const formatDateInput = (value: string) => {
        const onlyNumbers = value.replace(/\D/g, "");
        if (onlyNumbers.length <= 2) {
            return onlyNumbers;
        } else if (onlyNumbers.length <= 4) {
            return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2)}`;
        } else {
            return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2, 4)}/${onlyNumbers.slice(4, 8)}`;
        }
    };

    // --- LOGIC XỬ LÝ ẢNH ---

    const openFilePicker = () => fileInputRef.current?.click();

    const removeImage = () => {
        setField("imageFile", null);
    };

    // --- Logic xem trước hình ảnh ---
    const objectUrl = useMemo(() => {
        if (!form.imageFile) return null;
        return URL.createObjectURL(form.imageFile);
    }, [form.imageFile]);

    useEffect(() => {
        return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [objectUrl]);

    const previewSrc = objectUrl ?? form.imageURL ?? null;

    return (
        <div className="flex flex-column justify-between gap-[5vw]">
            {/* --- CỘT TRÁI: UPLOAD ẢNH --- */}
            <div className="w-1/3">
                <p className="text-lg mb-2.5">Thông tin nhân viên</p>
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={(e) => setField("imageFile", e.target.files?.[0] || null)}
                />

                <div className="w-md">
                    {previewSrc ? (
                        <div className="relative group h-75 w-75">
                            <Image
                                src={previewSrc}
                                alt="Employee Avatar Preview"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-white text-pink w-7 h-7 rounded-full 
                                           flex items-center justify-center text-sm shadow-md
                                           opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div className="h-75 w-75 bg-tgray05 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-lg text-gray-700 mb-2">
                                    Kéo & thả hình ảnh muốn tải lên
                                </p>
                                <button
                                    type="button"
                                    className="text-lg font-medium underline cursor-pointer text-gray-dark"
                                    onClick={openFilePicker}
                                >
                                    hoặc từ máy tính của bạn
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG TIN FORM --- */}
            <div className="w-2/3">
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <TextInput
                        disabled = {true}
                        label={"Mã số nhân viên"} 
                        placeHolder="" 
                        value={idData?.employeeId ?? "" }
                        onChange={(e) => setField("employeeId", e.target.value)} 
                    />
                    <TextInput
                        label={"Tên nhân viên"} 
                        placeHolder="Nhập tên" 
                        value={form.fullName}
                        onChange={(e) => setField("fullName", e.target.value)} 
                    />
                    
                    <div className="flex items-center justify-between gap-5">
                        <div className="w-1/2">
                            <SelectInput
                            label={"Giới tính"} 
                            options={genderOptions}     
                            value={form.gender}
                            onChange={(value) => setField("gender", value)}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                            label={"Ngày sinh"} 
                            placeHolder="DD/MM/YYYY" 
                            value={form.dateOfBirth}
                            onChange={(e) => {
                                const formattedDate = formatDateInput(e.target.value);
                                setField("dateOfBirth", formattedDate);
                            }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <TextInput
                            label={"Số điện thoại"} 
                            placeHolder="Nhập số điện thoại"        
                            value={form.phoneNumber}
                            onChange={(e) => setField("phoneNumber", e.target.value)} 
                        />
                        <TextInput
                            label={"Email"} 
                            placeHolder="Nhập email"        
                            value={form.email}
                            onChange={(e) => setField("email", e.target.value)} 
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        onClick={handleSubmit}
                        disabled={!isFormComplete}
                        className={`p-2.5 w-45 mt-5 self-end rounded-lg text-white font-semibold bg-pink text-base transition-all
                            ${!isFormComplete 
                                ? "opacity-50 cursor-not-allowed" 
                                : "cursor-pointer hover:bg-opacity-90"
                            }
                        `}
                    >
                        Thêm nhân viên
                    </button>
                </form>
            </div>
        </div>
    );
}