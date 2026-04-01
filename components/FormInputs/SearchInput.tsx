"use client";

import { useState } from "react";

interface Suggestion<T> {
    label: string;
    value: string;
    data: T;
}

interface SearchInputProps<T> {
    label: string,
    value: string | number,
    placeHolder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    labelPosition?: "left" | "top",
    suggestions: Suggestion<T>[],
    onSuggestionClick: (item: Suggestion<T>) => void,
    renderItem: (item: Suggestion<T>) => React.ReactNode;
    isError?: boolean
}

export function SearchInput<T>({ label, value, placeHolder, onChange, labelPosition="top", suggestions, onSuggestionClick, renderItem, isError } : SearchInputProps<T>) {
    const isLeft = labelPosition === "left";
    const borderClass = isError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-tgray5 focus:border-purple focus:ring-purple";

    const [showSuggestions, setShowSuggestions] = useState(false);

    return (
        <div className={`w-full font-display ${isLeft ? "flex items-center gap-x-4" : "flex flex-col gap-y-2.5"}`}>
            <label className={`text-sm font-normal text-tgray9 ${isLeft ? "w-25" : ""}`}>{label}</label>

            <div className="relative w-full">
                <input
                    placeholder={placeHolder}
                    value={value} 
                    onChange={onChange}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setShowSuggestions(false)}
                    className={`w-full h-12 px-2.5 rounded-lg border-[0.5px] border-solid focus:outline-none focus:ring-1 transition-colors caret-purple ${borderClass}`}
                />

                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-tgray5 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {suggestions.map((item, index) => (
                            <li
                                key={index}
                                onMouseDown={() => {
                                    onSuggestionClick(item);
                                    setShowSuggestions(false);
                                }}
                                className="px-4 py-2.5 text-sm text-tgray9 hover:bg-purple hover:text-white cursor-pointer transition-colors"
                            >
                                {renderItem(item)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}