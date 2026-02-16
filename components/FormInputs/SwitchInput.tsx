import { Switch } from "antd";

interface SwitchInputProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

export function SwitchInput({ label, checked, onChange }: SwitchInputProps) {

    return (
        <div className="flex items-center gap-5">
            <p className="text-sm font-normal text-tgray9">{label}</p>
            <Switch checked={checked} onChange={onChange}/>
        </div>
    )
}