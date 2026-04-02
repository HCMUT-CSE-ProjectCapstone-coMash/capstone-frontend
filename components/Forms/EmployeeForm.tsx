"use client";

import { useState } from "react";
import { TextInput } from "../FormInputs/TextInput";
import { useDispatch } from "react-redux";
import { addAlert } from "@/utilities/alertStore";
import { AlertType } from "@/types/alert";

interface EmployeeFormState {
    employeeName: string;
    employeePhone: string;
    employeeSalary: string;
   
}

const initialEmployeeFormState: EmployeeFormState = {
    employeeName: "",
    employeePhone: "",
    employeeSalary: "",
};

// const paymentOptions = [
//     { id: 'cash', label: 'Tiền mặt' },
//     { id: 'transfer', label: 'Chuyển khoản' },
//     { id: 'debit', label: 'Ghi nợ' },
// ];

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

        if (form.employeeSalary === "") {
            dispatch(addAlert({ type: AlertType.WARNING, message: "Vui lòng nhập lương nhân viên" }));
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
        </form>
    );
}