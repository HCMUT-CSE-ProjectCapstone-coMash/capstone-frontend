"use client";

// import { useParams } from "next/navigation";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/utilities/store";
import { useState } from "react";
import { LayoutModal } from "../Modal/LayoutModal";
import { DeleteEmployeeModal } from "../Modal/DeleteEmployeeModal";



export function DetailEmployeeByIdForm() {
    // const employeeId = useParams().employeeId as string;
    // const dispatch = useDispatch();
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    
    const employee = useSelector((state: RootState) => state.employee.selectedEmployee);

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
                        className="py-2 px-4 rounded-lg border border-red-500 bg-red-500 text-white text-sm font-medium transition hover:bg-red-600 hover:cursor-pointer"
                        onClick={() => setConfirmModalOpen(true)}
                    >
                        <p>Xoá nhân viên</p>
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
            <LayoutModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
            >
                <DeleteEmployeeModal employeeId={employee?.id ?? ""} onClose={() => setConfirmModalOpen(false)}/>
            </LayoutModal>
        </div>
    );
}