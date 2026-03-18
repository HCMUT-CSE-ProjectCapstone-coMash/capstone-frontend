
interface MoneyInputProps {
    label?: string,
    value: string ,
    placeHolder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    inputType?: "string",
    labelPosition?: "right" | "top"
}

export function MoneyInput({ label, placeHolder, value, onChange, inputType="string", labelPosition="top" } : MoneyInputProps) {
    const isRight = labelPosition === "right";
    
    return (
        <div className={`w-full font-display ${isRight ? "flex items-center justify-between" : "flex flex-col gap-y-2.5"}`}>
            <label className={`text-sm font-normal text-tgray9 ${isRight  ? "flex justify-between" : ""}`}>{label}</label>
            <input
                type={inputType} 
                placeholder={placeHolder}
                value={value} 
                onChange={onChange} 
                className={`${isRight ? 'w-30' : 'w-full'} px-3 py-2 rounded-lg border-[0.5px] border-solid border-tgray5 focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all`}
            />
        </div>
    )
}