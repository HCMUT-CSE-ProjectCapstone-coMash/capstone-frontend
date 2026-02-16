
interface TextInputProps {
    label: string,
    value: string | number,
    placeHolder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    inputType?: "text" | "number" | "password",
    labelPosition?: "left" | "top"
}

export function TextInput({ label, placeHolder, value, onChange, inputType="text", labelPosition="top" } : TextInputProps) {
    const isLeft = labelPosition === "left";
    
    return (
        <div className={`w-full font-display ${isLeft ? "flex items-center gap-x-4" : "flex flex-col gap-y-2.5"}`}>
            <label className={`text-sm font-normal text-tgray9 ${isLeft ? "w-25" : ""}`}>{label}</label>
            <input
                type={inputType} 
                placeholder={placeHolder}
                value={value} 
                onChange={onChange} 
                className="w-full h-12 px-2.5 rounded-lg border-[0.5px] border-solid border-tgray5 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
            />
        </div>
    )
}