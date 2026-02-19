import { SelectOption } from "@/types/UIType";
import { ArrowDownLineIcon } from "@/public/assets/Icons";

interface SelectInputProps {
    label: string,
    options: SelectOption[],
    value: string,
    onChange: (value: string) => void;
}

export function SelectInput({ label, options, value, onChange }: SelectInputProps) {

    return (
        <div className="flex flex-col gap-y-2.5 flex-1">
            <p className="text-sm font-normal text-tgray9">{label}</p>
            <div className="relative flex-1">
                <select 
                    className="text-sm p-2.5 rounded-lg border-[0.5px] border-solid border-tgray5 appearance-none w-full focus:outline-none focus:border-purple focus:ring-1 focus:ring-purple transition-all"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                >
                    <option value="">Lựa chọn</option>

                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="absolute right-3 top-1/2 -translate-y-1/2"><ArrowDownLineIcon width={24} height={24} fill={"gray"}/></div>
            </div>
        </div>
    )
}