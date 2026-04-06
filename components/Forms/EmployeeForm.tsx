"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

interface EmployeeFormState {
    employeeId: string;
    employeeName: string;
    employeeGender: string;
    employeeBirthDate: string;
    employeePhone: string;
    employeeMail: string;
   
}

const initialEmployeeFormState: EmployeeFormState = {
    employeeId: "",
    employeeName: "",
    employeeGender: "",
    employeeBirthDate: "",
    employeePhone: "",
    employeeMail: "",
};

const genderOptions = [
    { label: "Nữ", value: "Nữ" },
    { label: "Nam", value: "Nam" },
    { label: "Khác", value: "Khác" }
];

export function EmployeeForm() {
    const [form, setForm] = useState<EmployeeFormState>(initialEmployeeFormState);
    const dispatch = useDispatch();

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

    const formatDateInput = (value: string) => {
        // Loại bỏ tất cả các ký tự không phải là số
        const onlyNumbers = value.replace(/\D/g, "");

        // Cắt chuỗi và chèn dấu '/'
        if (onlyNumbers.length <= 2) {
            return onlyNumbers;
        } else if (onlyNumbers.length <= 4) {
            return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2)}`;
        } else {
            return `${onlyNumbers.slice(0, 2)}/${onlyNumbers.slice(2, 4)}/${onlyNumbers.slice(4, 8)}`;
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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
                className="p-2.5 w-45 mt-2.5 self-end rounded-lg text-white font-semibold bg-pink text-base cursor-pointer hover:bg-opacity-90 transition-all"
            >
                Thêm nhân viên
            </button>
        </form>
        
    );
}