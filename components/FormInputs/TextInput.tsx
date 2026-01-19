
interface TextInputProps {
    label: string,
    value: string,
    placeHolder: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    inputType?: "text" | "number" | "password"
}

export function TextInput({ label, placeHolder, value, onChange, inputType="text" } : TextInputProps) {

    return (
        <div className="flex flex-col gap-y-2.5 w-full font-display">
            <label className="text-sm font-normal text-tgray9">{label}</label>
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