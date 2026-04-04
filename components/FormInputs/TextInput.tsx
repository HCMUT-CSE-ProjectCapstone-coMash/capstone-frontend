
interface TextInputProps {
    label: string,
    value: string | number,
    placeHolder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    disabled?: boolean,
    inputType?: "text" | "number" | "password" | "textarea",
    labelPosition?: "left" | "top",
    isError?: boolean
}

export function TextInput({ label, placeHolder, value, onChange, disabled, inputType="text", labelPosition="top", isError } : TextInputProps) {
    const isLeft = labelPosition === "left";

    const borderClass = isError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-tgray5 focus:border-purple focus:ring-purple";

    const disabledClass = disabled ? "cursor-not-allowed opacity-70" : "";
    
    return (
        <div className={`w-full font-display ${isLeft ? "flex items-center gap-x-4" : "flex flex-col gap-y-2.5"}`}>
            <label className={`text-sm font-normal text-tgray9 ${isLeft ? "w-25" : ""}`}>{label}</label>

            {inputType === "textarea" ? (
                <textarea 
                    disabled={disabled}
                    placeholder={placeHolder}
                    value={value}
                    onChange={onChange}
                    className={`w-full min-h-20 p-2.5 resize-y rounded-lg border-[0.5px] border-solid focus:outline-none focus:ring-1 transition-colors caret-purple ${borderClass} ${disabledClass}`}
                />
            ) : (
                <input
                    disabled={disabled}
                    type={inputType} 
                    placeholder={placeHolder}
                    value={value} 
                    onChange={onChange}
                    className={`w-full h-12 px-2.5 rounded-lg border-[0.5px] border-solid focus:outline-none focus:ring-1 transition-colors caret-purple ${borderClass} ${disabledClass}`}
                />
            )}

        </div>
    )
}