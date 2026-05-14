import { useState, useRef, useEffect } from "react";
import { SelectOption } from "@/types/UIType";
import { ArrowDownLineIcon } from "@/public/assets/Icons";

interface SelectInputProps {
    label: string;
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    noDefaultOption?: boolean;
}

export function SelectInput({ label, options, value, onChange, disabled, noDefaultOption = false }: SelectInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value);
    const disabledClass = disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer";

    return (
        <div className="flex flex-col gap-y-2.5 flex-1 relative" ref={containerRef}>
            <p className="text-sm font-normal text-tgray9">{label}</p>
            
            <div className="relative flex-1">
                {/* Nút bấm hiển thị thay cho select */}
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`text-sm min-h-12.5 p-2.5 rounded-lg border-[0.5px] border-solid flex items-center justify-between transition-all 
                        ${isOpen ? "border-purple ring-1 ring-purple" : "border-tgray5"} 
                        ${disabledClass}`}
                >
                    <span className={!selectedOption ? "text-tgray9" : ""}>
                        {selectedOption ? selectedOption.label : "Lựa chọn"}
                    </span>
                    <ArrowDownLineIcon 
                        width={24} height={24} 
                        className={`text-gray transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>

                {/* Danh sách options tùy chỉnh */}
                {isOpen && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-tgray5 rounded-lg shadow-lg overflow-y-auto max-h-52">
                        {!noDefaultOption && (
                            <li
                                onClick={() => { onChange(""); setIsOpen(false); }}
                                className="p-2.5 text-sm hover:bg-purple/10 cursor-pointer"
                            >
                                Lựa chọn
                            </li>
                        )}
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                // Đổi màu tím ở đây: bg-purple text-white khi được chọn
                                className={`p-2.5 text-sm cursor-pointer transition-colors
                                    ${value === option.value 
                                        ? "bg-purple text-white" 
                                        : "hover:bg-purple/10 text-black"}
                                `}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}