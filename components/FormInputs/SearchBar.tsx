import type { ChangeEvent, KeyboardEvent } from "react";
import { SearchIcon } from "@/public/assets/Icons";

interface SearchBarProps {
    placeholder: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSearch?: () => void;
    className?: string;
}

export function SearchBar({ placeholder, value, onChange, onSearch, className = "" }: SearchBarProps) {
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && onSearch) {
            event.preventDefault();
            onSearch();
        }
    };

    return (
        <div className={`relative w-full max-w-sm ${className}`}>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <SearchIcon width={24} height={24} className="text-black" />
            </span>
            <input
                type="search"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                className="w-full h-10 pl-11 pr-4 rounded-lg border-[0.5px] border-solid border-gray-200 bg-white text-md text-gray-600 focus:border-purple focus:outline-none focus:ring-1 focus:ring-purple transition-colors caret-purple"
            />
        </div>
    );
}
