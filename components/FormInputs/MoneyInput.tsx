import React from "react";

interface MoneyInputProps {
    label?: string,
    value: string ,
    placeHolder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    inputType?: "text",
    labelPosition?: "right" | "top"
}

export function MoneyInput({ label, placeHolder, value, onChange, inputType="text", labelPosition="top" } : MoneyInputProps) {
    const isRight = labelPosition === "right";
    
    return (
        <div className={`w-full font-display ${isRight ? "flex items-center justify-between" : "flex flex-col gap-y-2.5"}`}>
            {label && (
                <label className={`text-sm font-normal text-tgray9 ${isRight ? "flex justify-between" : ""}`}>
                    {label}
                </label>
            )}
            <div className={`flex items-center bg-white text-sm
                ${isRight ? 'w-30' : 'w-full'} 
                px-3 py-2 rounded-lg border-[0.5px] border-solid border-tgray5 
                focus-within:border-purple focus-within:ring-1 focus-within:ring-purple transition-all
            `}>
                <input
                    type={inputType} 
                    placeholder={placeHolder}
                    value={value} 
                    onChange={onChange} 
                    className="w-full bg-transparent focus:outline-none"
                />
                <span className="ml-1 text-black text-sm font-normal">
                    VND
                </span>
            </div>
        </div>
    )
}