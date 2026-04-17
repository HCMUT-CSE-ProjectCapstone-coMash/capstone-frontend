"use client";

import { useQuery } from "@tanstack/react-query";
import { TextInput } from "../FormInputs/TextInput";
import { SelectInput } from "../FormInputs/SelectInput";
import Image from "next/image";
import { FetchEmployees } from "@/api/employees/employees";

interface Props {
    employeeId: string;
}

export function DetailEmployeeByIdForm({ employeeId }: Props) {
    const { data, isLoading } = useQuery({
        queryKey: ["employee", employeeId],
        queryFn: () => FetchEmployees(1, 100, employeeId),
        enabled: !!employeeId,
    });

    // Lọc chính xác theo employeeId tránh trường hợp search gần đúng
    const employee = data?.items?.find(
        (item: { employeeId: string }) => item.employeeId === employeeId
    );

    const previewSrc = employee?.imageURL ?? null;

    if (isLoading) return <div className="text-gray-500">Đang tải...</div>;

    return (
        <div className="flex flex-column justify-between gap-[5vw]">
            {/* --- CỘT TRÁI: ẢNH NHÂN VIÊN --- */}
            <div className="w-1/3">
                <p className="text-lg mb-2.5">Thông tin nhân viên</p>
                <div className="w-md">
                    {previewSrc ? (
                        <div className="relative group h-75 w-75">
                            <Image
                                src={previewSrc}
                                alt="Employee Avatar"
                                fill
                                className="object-cover rounded-lg"
                                unoptimized
                            />
                        </div>
                    ) : (
                        <div className="h-75 w-75 bg-tgray05 flex items-center justify-center rounded-lg">
                            <p className="text-sm">Không có ảnh</p>
                        </div>
                    )}
                </div>
            </div>

            {/* --- CỘT PHẢI: THÔNG TIN FORM (read-only) --- */}
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
                        <TextInput
                            disabled
                            label="Số điện thoại"
                            placeHolder=""
                            value={employee?.phoneNumber ?? ""}
                            onChange={() => {}}
                        />
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
    );
}