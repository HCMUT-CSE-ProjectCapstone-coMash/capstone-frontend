"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";
import Image from "next/image";
import { CreateEmployeeAsync, GetNewEmployeeId } from "@/api/employees/employees";
import { useRouter } from "next/navigation";
import { CreateEmployeePayload } from "@/types/employee";
import { DatePickerInput } from "../FormInputs/DatePickerInput";

interface FormState {
    fullName: string,
    gender: string,
    dateOfBirth: string,
    phoneNumber: string,
    email: string,
    image: File | null,
}

const initialFormState: FormState = {
    fullName: "",
    gender: "",
    dateOfBirth: "",
    phoneNumber: "",
    email: "",
    image: null,
};

const genderOptions = [
    { label: "Nữ", value: "Nữ" },
    { label: "Nam", value: "Nam" },
    { label: "Khác", value: "Khác" }
];

export function EmployeeForm() {
    const router = useRouter();
    const dispatch = useDispatch();

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [form, setForm] = useState<FormState>(initialFormState);
    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const { data } = useQuery({
        queryKey: ["new-employee-id"],
        queryFn: GetNewEmployeeId,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });

    const employeeId = data?.employeeId ?? "";
    
    // --- Mutation xử lý gửi data lên Database ---
    const mutation = useMutation({
        mutationFn: ({ employeeData, employeeId } : { employeeData: CreateEmployeePayload, employeeId: string }) => CreateEmployeeAsync(employeeData, employeeId),

        onSuccess: () => {
            dispatch(addAlert({ type: AlertType.SUCCESS, message: "Thêm nhân viên thành công!" }));
            router.back();
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

        const employeeData : CreateEmployeePayload = {
            fullName: form.fullName,
            gender: form.gender,
            dateOfBirth: form.dateOfBirth,
            phoneNumber: form.phoneNumber,
            email: form.email,
            image: form.image,
        }

        mutation.mutate({ employeeData, employeeId });
    };

    // --- LOGIC XỬ LÝ ẢNH ---

    const openFilePicker = () => fileInputRef.current?.click();

    const removeImage = () => {
        setField("image", null);
    };

    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setField("image", files[0]);
    }

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
                    {form.image ? (
                        <div className="relative group h-75 w-75">
                            <Image
                                src={URL.createObjectURL(form.image)}
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
                        value={employeeId}
                        onChange={() => {}} 
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
                            <DatePickerInput
                                label="Ngày sinh"
                                placeHolder=""
                                value={form.dateOfBirth}
                                onChange={(value) => setField("dateOfBirth", value)}
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
                        disabled={mutation.isPending}
                        className={`p-2.5 w-45 mt-5 self-end rounded-lg text-white font-semibold bg-pink text-base transition-all
                            ${mutation.isPending
                                ? "opacity-50 cursor-not-allowed" 
                                : "cursor-pointer hover:bg-opacity-90"
                            }
                        `}
                    >
                        {mutation.isPending ? "Đang thêm..." : "Thêm nhân viên"}
                    </button>
                </form>
            </div>
        </div>
    );
}