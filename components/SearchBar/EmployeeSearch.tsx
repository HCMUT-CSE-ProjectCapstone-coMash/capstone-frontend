"use client";

import { useState } from "react";
import { SearchIcon } from "@/public/assets/Icons";

export function EmployeeSearch() {
    // State để lưu giá trị ô input
    const [searchValue, setSearchValue] = useState("");
    // State để quản lý việc ẩn/hiện bảng gợi ý
    const [showDropdown, setShowDropdown] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        setShowDropdown(true); // Hiện gợi ý khi bắt đầu gõ
    };

    return (
        <div className="relative w-80">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <SearchIcon width={24} height={24} className="text-tgray9" />
                </div>
                <input
                    type="text"
                    className="block w-full py-2.5 pl-12 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Nhập tên nhân viên"
                    value={searchValue}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    // Dùng setTimeout ở onBlur để nếu sau này bạn có nút click bên trong dropdown thì nó không bị đóng ngay lập tức
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                />
            </div>

            {/* Khung gợi ý hiển thị khi showDropdown là true và có dữ liệu nhập vào */}
            {showDropdown && searchValue && (
                <div className="absolute w-full bg-white border border-black z-10 py-4 shadow-sm">
                    <p className="text-center text-sm text-black">
                        Không có dữ liệu
                    </p>
                </div>
            )}
        </div>
    );
}