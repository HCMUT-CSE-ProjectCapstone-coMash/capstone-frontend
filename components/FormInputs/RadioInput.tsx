import React from "react";

// Định nghĩa kiểu dữ liệu cho từng tùy chọn radio
export interface RadioOption {
    value: string;
    label: string;
};

interface RadioInputProps {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    options: RadioOption[];
    labelPosition?: "right" | "top";
}

export function RadioInput({ label, value, onChange, options, labelPosition = "top" }: RadioInputProps) {
    const isRight = labelPosition === "right";
    
    return (
        <div className={`w-full font-display ${isRight ? "flex items-center justify-between" : "flex flex-col gap-y-2.5"}`}>
            {label && (
                <label className={`text-sm  text-tgray9 ${isRight ? "w-max" : ""}`}>
                    {label}
                </label>
            )}
            
            {/* Vùng chứa các Radio Buttons */}
            <div className={`flex items-center gap-6 text-sm ${isRight ? 'w-auto' : 'w-full'}`}>
                {options.map((option) => {
                    const isChecked = value === option.value;
                    
                    return (
                        <label key={option.value} className="group flex items-center gap-2 cursor-pointer">
                            {/* Text hiển thị (Tiền mặt, Chuyển khoản...) */}
                            <span className={`text-sm transition-colors ${isChecked ? 'text-black font-weight-400' : 'text-tgray6 group-hover:text-black'}`}>
                                {option.label}
                            </span>
                            
                            {/* Nút Radio Custom */}
                            <div className="relative flex items-center justify-center w-4.5 h-4.5">
                                <input
                                    type="radio"
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={onChange}
                                    className="sr-only" // Ẩn input mặc định của trình duyệt
                                />
                                
                                {/* Vòng tròn viền */}
                                <div
                                    className={`flex items-center justify-center w-full h-full rounded-full border transition-all
                                        ${isChecked ? 'border-black' : 'border-purple group-hover:border-purple'}
                                    `}
                                >
                                    {/* Chấm tròn bên trong */}
                                    {isChecked && (
                                        <div className="w-2 h-2 rounded-full bg-purple"></div>
                                    )}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </div>
        </div>
    );
}