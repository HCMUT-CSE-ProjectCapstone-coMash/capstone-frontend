"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

interface EmployeeFormState {
    employeeName: string;
    employeeGender: string;
    employeeBirthDate: string;
    employeePhone: string;
    employeeMail: string;
   
}

const initialEmployeeFormState: EmployeeFormState = {
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

        if (!form.employeePhone.trim()) {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập số điện thoại nhân viên" }));
            return;
        }

        const dataToSubmit = {
            ...form,
        };
        console.log("Dữ liệu hóa đơn chuẩn bị gửi:", dataToSubmit);
        
        dispatch(addAlert({ type: AlertType.SUCCESS, message: "Xuất hóa đơn thành công!" }));
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
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
                    onChange={(e) => setField("employeeBirthDate", e.target.value)} 
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
        </form>
    );
}