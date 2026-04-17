"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import Image from "next/image";

interface EmployeeFormState {
    employeeId: string;
    employeeName: string;
    employeeGender: string;
    employeeBirthDate: string;
    employeePhone: string;
    employeeMail: string;
    imageFile: File | null;
    imagePreviewUrl: string | null;
}

const initialEmployeeFormState: EmployeeFormState = {
    employeeId: "",
    employeeName: "",
    employeeGender: "",
    employeeBirthDate: "",
    employeePhone: "",
    employeeMail: "",
    imageFile: null,
    imagePreviewUrl: null,
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.employeeName.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập tên nhân viên" }));
            return;
        }

        if (!form.employeeGender.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập giới tính nhân viên" }));
            return;
        }

        if (!form.employeeBirthDate.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập ngày sinh nhân viên" }));
            return;
        }

        if (!form.employeePhone.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số điện thoại nhân viên" }));
            return;
        }

        if (!form.employeeMail.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập email nhân viên" }));
            return;
        }

        const dataToSubmit = {
            ...form,
        };
        console.log("Dữ liệu nhân viên chuẩn bị gửi:", dataToSubmit);
        
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm nhân viên thành công!" }));
    };

    const isFormComplete = 
        form.employeeId.trim() !== "" &&
        form.employeeName.trim() !== "" &&
        form.employeeGender.trim() !== "" &&
        form.employeeBirthDate.trim() !== "" &&
        form.employeePhone.trim() !== "" &&
        form.employeeMail.trim() !== "";

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
    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setField("imageFile", files[0]);
        setField("imagePreviewUrl", null);
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const removeImage = () => {
        setField("imageFile", null);
        setField("imagePreviewUrl", null);
    };

    const objectUrl = useMemo(() => {
        if (!form.imageFile) return null;
        return URL.createObjectURL(form.imageFile);
    }, [form.imageFile]);
    
    useEffect(() => {
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [objectUrl]);
    
    const previewSrc = objectUrl ?? form.imagePreviewUrl ?? null;

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
                    onChange={(e) => handleFiles(e.target.files)}
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
                        label={"Mã số nhân viên"} 
                        placeHolder="" 
                        value={form.employeeId}
                        onChange={(e) => setField("employeeId", e.target.value)} 
                    />
                    <TextInput
                        label={"Tên nhân viên"} 
                        placeHolder="Nhập tên" 
                        value={form.employeeName}
                        onChange={(e) => setField("employeeName", e.target.value)} 
                    />
                    
                    <div className="flex items-center justify-between gap-5">
                        <div className="w-1/2">
                            <SelectInput
                            label={"Giới tính"} 
                            options={genderOptions}     
                            value={form.employeeGender}
                            onChange={(value) => setField("employeeGender", value)}
                            />
                        </div>
                        <div className="w-1/2">
                            <TextInput
                            label={"Ngày sinh"} 
                            placeHolder="dd/mm/yyyy" 
                            value={form.employeeBirthDate}
                            onChange={(e) => {
                                const formattedDate = formatDateInput(e.target.value);
                                setField("employeeBirthDate", formattedDate);
                            }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-5">
                        <TextInput
                            label={"Số điện thoại"} 
                            placeHolder="Nhập số điện thoại"        
                            value={form.employeePhone}
                            onChange={(e) => setField("employeePhone", e.target.value)} 
                        />
                        <TextInput
                            label={"Email"} 
                            placeHolder="Nhập email"        
                            value={form.employeeMail}
                            onChange={(e) => setField("employeeMail", e.target.value)} 
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