import { SearchIcon } from "@/public/assets/Icons"

interface NormalSearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    className?: string;
}

export function NormalSearchInput({ value, onChange, placeholder, className } : NormalSearchInputProps) {

    return (
        <div className={`flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 ${className ?? ""}`}>
            <SearchIcon width={24} height={24} className="shrink-0"/>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full text-sm outline-none"
            />
        </div>
    )
}